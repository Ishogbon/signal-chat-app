package com.signalchatapp.chatserver;

import java.io.IOException;
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

@ServerEndpoint(value = "/chat_endpoint",
		configurator = ChatServerSessionConfigurator.class,
        encoders = {MessageEncoder.class},
        decoders = {MessageDecoder.class})
public class ChatServer {
    private String userHandleTag;
    private static Map<String, Session> handleTagToSessionMap = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, EndpointConfig config) throws IOException {
    	HttpSession httpSession = (HttpSession) config.getUserProperties().get(HttpSession.class.getName());
        if (httpSession != null && httpSession.getAttribute("handleTag") != null) {
            userHandleTag = (String) httpSession.getAttribute("handleTag");
            handleTagToSessionMap.put(userHandleTag, session);
        } else {
            session.close();
        }
    }

    @OnMessage
    public void onMessage(Session session, Message message) {
		sendMessage(message, userHandleTag);
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
    private static void sendMessage(Message message, String sender) {
    	for (Map.Entry<String, Session> entry : handleTagToSessionMap.entrySet()) {
            String handleTag = entry.getKey();
            Session session = entry.getValue();
            if (handleTag.equals(message.getRecipient())) {
                try {
                    message.setSender(sender);
                    session.getAsyncRemote().sendObject(message);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }
}