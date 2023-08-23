package com.signalchatapp.chatserver;

import java.util.logging.Logger;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.http.HttpSession;
import javax.websocket.EndpointConfig;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.Gson;

@ServerEndpoint(value = "/chat_endpoint",
		configurator = ChatServerSessionConfigurator.class,
        encoders = {MessageEncoder.class},
        decoders = {MessageDecoder.class})
public class ChatServer {
	private static final Logger LOGGER = Logger.getLogger(ChatServer.class.getName());
    private String userHandleTag;
    private static Map<String, Session> handleTagToSessionMap = new ConcurrentHashMap<>();
    
	private static final String DB_URL = "jdbc:mysql://localhost:3306/signal_chat_app";
    private static final String DB_USER = "signal";
    private static final String DB_PASSWORD = "8BAnEJMPtEBHnz1g";

    @OnOpen
    public void onOpen(Session session, EndpointConfig config) throws IOException {
    	HttpSession httpSession = (HttpSession) config.getUserProperties().get(HttpSession.class.getName());
        if (httpSession != null && httpSession.getAttribute("handleTag") != null) {
            userHandleTag = (String) httpSession.getAttribute("handleTag");
            handleTagToSessionMap.put(userHandleTag, session);
            retrieveSendAndDeleteMessages(userHandleTag);
        } else {
            session.close();
        }
    }

    @OnMessage
    public void onMessage(Session session, Message message) {
    	// Sets the amount of time it took for the message to arrive at the server
    	message.setMessageSendDuration((int) (System.currentTimeMillis() - message.getMessageSendDuration()));
    	message.setServerProcessTime(System.currentTimeMillis());
		boolean message_successfully_sent = sendMessage(message, userHandleTag);
		if (!message_successfully_sent) {
			message.setSender(userHandleTag);
			this.storeMessage(message);
		}
    }
    
    public boolean storeMessage(Message message) {
        
        try (Connection connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            // Use a prepared statement to insert the public key into the database
            String sql = "INSERT INTO `stored_messages` (`sender_handle_tag`, `message`, `receiver_handle_tag`) VALUES(?, ?, ?)";
            try (PreparedStatement statement = connection.prepareStatement(sql)) {

                Gson gson = new Gson();
                statement.setString(1, message.getSender());
                statement.setString(2, gson.toJson(message, Message.class));
                statement.setString(3, message.getRecipient());
                
                return statement.execute();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public void retrieveSendAndDeleteMessages(String handleTag) {
        try (Connection connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            // Use a prepared statement to retrieve messages with the specified handle tag
            String retrieveSql = "SELECT `message` FROM `stored_messages` WHERE `receiver_handle_tag` = ?";
            try (PreparedStatement retrieveStatement = connection.prepareStatement(retrieveSql)) {
                retrieveStatement.setString(1, handleTag);
                ResultSet resultSet = retrieveStatement.executeQuery();

                while (resultSet.next()) {
                	Gson gson = new Gson();
                    Message message = gson.fromJson(resultSet.getString("message"), Message.class);
                    sendMessage(message, message.getSender());
                }
            }

            // Delete the retrieved messages
            String deleteSql = "DELETE FROM `stored_messages` WHERE `receiver_handle_tag` = ?";
            try (PreparedStatement deleteStatement = connection.prepareStatement(deleteSql)) {
                deleteStatement.setString(1, handleTag);
                deleteStatement.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            // Handle the exception as needed
        }
    }

    @OnClose
    public void onClose(Session session) throws IOException {
    	handleTagToSessionMap.values().remove(session);
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        // Do error handling here
    }
    // Change to sendToRecipient
    private static boolean sendMessage(Message message, String sender) {
    	boolean message_sent = false;
    	for (Map.Entry<String, Session> entry : handleTagToSessionMap.entrySet()) {
            String handleTag = entry.getKey();
            Session session = entry.getValue();
            if (handleTag.equals(message.getRecipient())) {
                try {
                    message.setSender(sender);
                    message.setServerProcessTime(System.currentTimeMillis() - message.getServerProcessTime());
                    // Sets the timestamp the message left the server
                    message.setMessageReceivedDuration(System.currentTimeMillis());
                    session.getAsyncRemote().sendObject(message);
                    message_sent = true;
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    	return message_sent;
    }
}