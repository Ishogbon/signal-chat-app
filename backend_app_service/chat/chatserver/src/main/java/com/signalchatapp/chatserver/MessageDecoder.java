package com.signalchatapp.chatserver;

import com.google.gson.Gson;

import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.EndpointConfig;

public class MessageDecoder implements Decoder.Text<Message> {
	private static Gson gson = new Gson();
  @Override
  public Message decode(String jsonMessage) throws DecodeException {

    return gson.fromJson(jsonMessage, Message.class);

  }

  @Override
  public boolean willDecode(String s) {
      return (s != null);
  }

  @Override
  public void init(EndpointConfig ec) {
    System.out.println("Initializing message decoder");
  }

  @Override
  public void destroy() {
    System.out.println("Destroyed message decoder");
  }
}