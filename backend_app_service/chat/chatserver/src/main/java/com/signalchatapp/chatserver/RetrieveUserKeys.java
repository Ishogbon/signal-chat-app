package com.signalchatapp.chatserver;

import java.util.List;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;
/**
 * Servlet implementation class RetrieveUserKeys
 */
@WebServlet("/retrieve_user_keys")
public class RetrieveUserKeys extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public RetrieveUserKeys() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
    ;
	private static final String DB_URL = "jdbc:mysql://localhost:3306/signal_chat_app";
    private static final String DB_USER = "signal";
    private static final String DB_PASSWORD = "8BAnEJMPtEBHnz1g";
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	    response.setContentType("application/json;charset=UTF-8");
		PrintWriter out = response.getWriter();

        // Check if the user is signed in by checking the handleTag in the session
        String handleTag = (String) request.getSession().getAttribute("handleTag");

        if (handleTag != null && !handleTag.isEmpty()) {
            // Fetch the get parameter handleTag
            handleTag = request.getParameter("handleTag");

            // Use handleTag to fetch the corresponding columns from the database
            String identityPublicKeyJson = null;
            String signedPreKeyPublicJson = null;
            String preKeysPublicJson = null;
            Connection conn = null;
            PreparedStatement ps = null;
            ResultSet rs = null;

            try {
                conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
                String query = "SELECT identity_public_key, signed_pre_key_public, pre_keys_pub FROM users WHERE handle_tag=?";
                ps = conn.prepareStatement(query);
                ps.setString(1, handleTag);
                rs = ps.executeQuery();

                if (rs.next()) {
                    identityPublicKeyJson = rs.getString("identity_public_key");
                    signedPreKeyPublicJson = rs.getString("signed_pre_key_public");
                    preKeysPublicJson = rs.getString("pre_keys_pub");
                }
            } catch (SQLException e) {
            	response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                e.printStackTrace();
            } finally {
            }

            if (identityPublicKeyJson != null && signedPreKeyPublicJson != null && preKeysPublicJson != null) {
                // Parse the fetched data into Java objects for further processing
                Gson gson = new Gson();
                IdentityPublicKeyObject identityPublicKeyObj = gson.fromJson(identityPublicKeyJson, IdentityPublicKeyObject.class);
                SignedPreKeyPublicObject signedPreKeyPublicObj = gson.fromJson(signedPreKeyPublicJson, SignedPreKeyPublicObject.class);
                Type listType = new TypeToken<List<PreKeysPublicObject>>() {}.getType();
                List<PreKeysPublicObject> preKeysList = new Gson().fromJson(preKeysPublicJson, listType);

                PreKeyObject preKey = new PreKeyObject();
                preKey.setRegistrationId(preKey.hashHandleTagToRegistrationId(handleTag));
                preKey.setIdentityKey(identityPublicKeyObj.getPubKey());
                preKey.setSignedPreKey(signedPreKeyPublicObj.getId(), signedPreKeyPublicObj.getPubKey(), signedPreKeyPublicObj.getSignature());
	            try {
	                preKey.setPreKey(preKeysList.get(preKeysList.size() - 1).getId(), preKeysList.get(preKeysList.size() - 1).getPubKey());
	                preKeysList.remove(preKeysList.size() - 1);
                } catch (ArrayIndexOutOfBoundsException e) {
                }
                
                out.write(gson.toJson(preKey));

                // Convert the processed Java object back to JSON string
                String processedPreKeysPublicJson = gson.toJson(preKeysList);

                // Update pre_keys_public with the processed JSON string in the database
                try {
                    conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
                    String updateQuery = "UPDATE users SET pre_keys_pub=? WHERE handle_tag=?";
                    ps = conn.prepareStatement(updateQuery);
                    ps.setString(1, processedPreKeysPublicJson);
                    ps.setString(2, handleTag);
                    ps.executeUpdate();
                } catch (SQLException e) {
                	response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    e.printStackTrace();
                } finally {
                }


            } else {
            	response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.println("No data found for the provided handleTag.");
            }
        } else {
            // Handle the case when the user is not signed in
        	response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.println("User not signed in. Please sign in first.");
        }

        out.close();
    }
	
	private static class PreKeyObject {
		private static class SignedPreKey {
			private int keyId;
			private String publicKey;
			private String signature;

			public int getKeyId() {
				return keyId;
			}
			public void setKeyId(int keyId) {
				this.keyId = keyId;
			}
			public String getPublicKey() {
				return publicKey;
			}
			public void setPublicKey(String publicKey) {
				this.publicKey = publicKey;
			}
			public String getSignature() {
				return signature;
			}
			public void setSignature(String signature) {
				this.signature = signature;
			}
		}
		private static class PreKey {
			private int keyId;
			private String publicKey;

			public int getKeyId() {
				return keyId;
			}
			public void setKeyId(int keyId) {
				this.keyId = keyId;
			}
			public String getPublicKey() {
				return publicKey;
			}
			public void setPublicKey(String publicKey) {
				this.publicKey = publicKey;
			}
		}

		private int registrationId;
		private String identityKey;
		private SignedPreKey signedPreKey;
		private PreKey preKey;
		
		public static int hashHandleTagToRegistrationId (String string) {
	        int hash = 0;
	        if (string.length() == 0) {
	            return hash;
	        }

	        for (int i = 0; i < string.length(); i++) {
	            char chr = string.charAt(i);
	            hash = ((hash << 5) - hash) + chr;
	            hash |= 0; // Convert to 32-bit integer
	        }

	        if (hash < 0) {
	            return hash * -1;
	        }

	        return hash;
	    }

		public int getRegistrationId() {
			return registrationId;
		}
		public void setRegistrationId(int registrationId) {
			this.registrationId = registrationId;
		}
		public String getIdentityKey() {
			return identityKey;
		}
		public void setIdentityKey(String identityKey) {
			this.identityKey = identityKey;
		}
		public SignedPreKey getSignedPreKey() {
			return signedPreKey;
		}
		public void setSignedPreKey(int keyId, String publicKey, String signature) {
			this.signedPreKey = new SignedPreKey();
			this.signedPreKey.setKeyId(keyId);
			this.signedPreKey.setPublicKey(publicKey);
			this.signedPreKey.setSignature(signature);
		}
		public PreKey getPreKey() {
			return preKey;
		}
		public void setPreKey(int keyId, String publicKey) {
			this.preKey = new PreKey();
			this.preKey.setKeyId(keyId);
			this.preKey.setPublicKey(publicKey);
		}
	}

    private static class IdentityPublicKeyObject {
        private String pubKey;
        
        public IdentityPublicKeyObject(String pubKey) {
        	this.pubKey = pubKey;
        }

		public String getPubKey() {
			return pubKey;
		}
    }

    private static class SignedPreKeyPublicObject {
    	public int id;
    	public String pubKey;
    	public String signature;
    	
    	public SignedPreKeyPublicObject(int id, String pubKey, String signature) {
    		this.id = id;
    		this.pubKey = pubKey;
    		this.signature = signature;
    	}
    	
		public int getId() {
			return id;
		}
		public String getPubKey() {
			return pubKey;
		}
		public String getSignature() {
			return signature;
		}
    }

    private static class PreKeysPublicObject {
    	private int id;
        private String pubKey;

        // Constructors
        public PreKeysPublicObject() {
        }

        public PreKeysPublicObject(int id, String pubKey) {
            this.id = id;
            this.pubKey = pubKey;
        }

        // Getters and Setters
        public int getId() {
            return id;
        }

        public String getPubKey() {
            return pubKey;
        }
    }
}
