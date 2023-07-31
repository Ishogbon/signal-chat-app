package com.signalchatapp.chatserver;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@WebServlet("/store_public_key")
public class StoreIdentityPublicKey extends HttpServlet {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private static final String DB_URL = "jdbc:mysql://localhost:3306/signal_chat_app";
    private static final String DB_USER = "signal";
    private static final String DB_PASSWORD = "8BAnEJMPtEBHnz1g";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);

        if (session != null && session.getAttribute("handleTag") != null) {
            // User is authenticated, proceed to store the public key
        	
        	BufferedReader reader = new BufferedReader(new InputStreamReader(request.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
                
            String publicKey = sb.toString();

            // Call a method to store the public key in the database
            if (storePublicKeyInDatabase(session.getAttribute("handleTag").toString(), publicKey)) {
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("Public key stored successfully.");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("Failed to store public key.");
            }
        } else {
            // User is not authenticated, return an unauthorized response
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("User is not authenticated.");
        }
    }

    private boolean storePublicKeyInDatabase(String handleTag, String publicKey) {
        try (Connection connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            // Use a prepared statement to insert the public key into the database
            String sql = "UPDATE `users` SET identity_public_key = ? WHERE handle_tag = ?";
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setString(1, publicKey);
                statement.setString(2, handleTag);
                int rowsAffected = statement.executeUpdate();
                return rowsAffected > 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
