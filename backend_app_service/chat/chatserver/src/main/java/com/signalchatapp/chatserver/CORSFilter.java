package com.signalchatapp.chatserver;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebFilter("/*") // This filter will intercept all requests
public class CORSFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Allow requests from all origins (you can restrict it to specific origins if needed)
        httpResponse.setHeader("Access-Control-Allow-Origin", "http://localhost");

        // Allow specific HTTP methods (e.g., GET, POST, OPTIONS, etc.)
        httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST");

        // Allow specific headers (e.g., Authorization, Content-Type, etc.)
        httpResponse.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

        // Allow credentials (cookies, HTTP authentication) - This is optional and can be omitted if not needed
        httpResponse.setHeader("Access-Control-Allow-Credentials", "true");

        // Set the maximum age (in seconds) for which the CORS information is cached by the browser (optional)
        httpResponse.setHeader("Access-Control-Max-Age", "3600"); // 1 hour

        chain.doFilter(request, httpResponse);
    }

    // You can add the init() and destroy() methods if needed
    // They are not used in this example, but the interface requires you to implement them.
}
