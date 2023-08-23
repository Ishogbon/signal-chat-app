package com.signalchatapp.chatserver;

public class Message {
	private String sender;
    private String recipient;
    private String messageType;
    private String message;
    
	private int encryptDuration;
    private long messageSendDuration;
    private long serverProcessTime;
    private long messageReceivedDuration;
    private int decryptDuration;
    
    public int getEncryptDuration() {
		return encryptDuration;
	}
	public void setEncryptDuration(int encryptDuration) {
		this.encryptDuration = encryptDuration;
	}
	public long getMessageSendDuration() {
		return messageSendDuration;
	}
	public void setMessageSendDuration(long messageSendDuration) {
		this.messageSendDuration = messageSendDuration;
	}
	public long getServerProcessTime() {
		return serverProcessTime;
	}
	public void setServerProcessTime(long serverProcessTime) {
		this.serverProcessTime = serverProcessTime;
	}
	public long getMessageReceivedDuration() {
		return messageReceivedDuration;
	}
	public void setMessageReceivedDuration(long messageReceivedDuration) {
		this.messageReceivedDuration = messageReceivedDuration;
	}
	public int getDecryptDuration() {
		return decryptDuration;
	}
	public void setDecryptDuration(int decryptDuration) {
		this.decryptDuration = decryptDuration;
	}

	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public String getRecipient() {
		return recipient;
	}
	public void setRecipient(String recipient) {
		this.recipient = recipient;
	}
	public String getSender() {
		return sender;
	}
	public void setSender(String sender) {
		this.sender = sender;
	}
	public String getMessageType() {
		return messageType;
	}
	public void setMessageType(String messageType) {
		this.messageType = messageType;
	}
}