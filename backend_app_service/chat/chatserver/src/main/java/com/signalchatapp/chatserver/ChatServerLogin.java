package com.signalchatapp.chatserver;

import java.io.IOException;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/auth_user_a934_2592_7283_58f3_fh34_2h45")
public class ChatServerLogin extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String handleTag = request.getParameter("handle_tag");
		if (handleTag != null) {
			HttpSession session = request.getSession();
			session.setAttribute("handleTag", handleTag);
			
			response.setStatus(HttpServletResponse.SC_OK);

		}
		else {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		}
	}
}
