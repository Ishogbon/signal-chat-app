package com.signalchatapp.chatserver;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.servlet.http.HttpSession;
import javax.websocket.EncodeException;
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
    private Session session;
    private String userHandleTag;
    private static Set<ChatServer> chatServers = new CopyOnWriteArraySet<>();

    @OnOpen
    public void onOpen(Session session, EndpointConfig config) throws IOException {
    	HttpSession httpSession = (HttpSession) config.getUserProperties().get(HttpSession.class.getName());
    	if (httpSession != null && httpSession.getAttribute("handleTag") != null) {
    		userHandleTag = (String) httpSession.getAttribute("handleTag");
    	}
    	else {
    		session.close();
    	}
        this.session = session;
        chatServers.add(this);

    }

    @OnMessage
    public void onMessage(Session session, Message message) 
      throws IOException {
        try {
			sendMessage(message, userHandleTag);
		} catch (IOException | EncodeException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }

    @OnClose
    public void onClose(Session session) throws IOException {
        chatServers.remove(this);
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        // Do error handling here
    }
    // Change to sendToRecipient
    private static void sendMessage(Message message, String sender) 
      throws IOException, EncodeException {
    	for (ChatServer endpoint : chatServers) {
            synchronized (endpoint) {
                if (endpoint.userHandleTag.equals(message.getRecipient())) {
                    try {
                        message.setRecipient(sender);
                        endpoint.session.getBasicRemote().sendObject(message);
                    } catch (IOException | EncodeException e) {
                        e.printStackTrace();
                    }
                    break; // Break out of the loop once a match is found
                }
            }
        }
    }
}