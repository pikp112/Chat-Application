using Microsoft.AspNetCore.SignalR;

namespace ChatApplication.Chat
{
    public class ChatHub(IDictionary<string, UserRoomConnection> connection) : Microsoft.AspNetCore.SignalR.Hub
    {
        private readonly IDictionary<string, UserRoomConnection> _connection = connection;

        public async Task JoinRoom(UserRoomConnection userConnection)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userConnection.Room!);

            _connection[Context.ConnectionId] = userConnection;

            await Clients.Group(userConnection.Room!)
                .SendAsync("ReceiveMessage", "Bot", $"{userConnection.User} has joined the group", DateTime.Now);

            await SendConnectedUser(userConnection.Room!);
        }

        public async Task SendMessage(string message)
        {
            if (_connection.TryGetValue(Context.ConnectionId, out UserRoomConnection? userRoomConnection))
            {
                await Clients.Group(userRoomConnection.Room!)
                    .SendAsync("ReceiveMessage", userRoomConnection.User, message, DateTime.Now);
            }
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            if (!_connection.TryGetValue(Context.ConnectionId, out UserRoomConnection? userRoomConnection))
            {
                return base.OnDisconnectedAsync(exception);
            }
            _connection.Remove(Context.ConnectionId);

            Clients.Group(userRoomConnection.Room!)
                .SendAsync("ReceiveMessage", "Bot", $"{userRoomConnection.User} has left the group", DateTime.Now);

            SendConnectedUser(userRoomConnection.Room!); // Send updated list of connected users

            return base.OnDisconnectedAsync(exception);
        }

        public Task SendConnectedUser(string room)
        {
            var users = _connection.Values
                .Where(x => x.Room == room)
                .Select(x => x.User);

            return Clients.Group(room)
                .SendAsync("ConnectedUsers", users);
        }
    }
}