package main.java.de.voidtech.netflixparty.entities.message;

import org.json.JSONObject;

public class SystemMessage {
	
	private String type;
	
	private JSONObject data;
	
	public SystemMessage(MessageBuilder builder)
	{
	  this.type = builder.getSystemMessageType();
	  this.data = builder.getSystemMessageData();
	}
	
	public String convertToJson() {
		return new JSONObject().put("type", type).put("data", data).toString();
	}
}