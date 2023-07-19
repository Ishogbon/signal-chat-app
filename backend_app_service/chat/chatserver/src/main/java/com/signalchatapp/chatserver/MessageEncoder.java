package com.signalchatapp.chatserver;

import com.google.gson.Gson;
import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class MessageEncoder implements Encoder.Text<Message> {
	private static Gson gson = new Gson();
  @Override
  public String encode(Message message) throws EncodeException {

    return gson.toJson(message);

  }

  @Override
  public void init(EndpointConfig ec) {
    System.out.println("Initializing message encoder");
  }

    @Override
    public void destroy() {
        System.out.println("Destroying encoder...");
    }

}