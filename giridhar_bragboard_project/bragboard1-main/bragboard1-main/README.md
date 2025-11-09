
In the first two weeks of the project, the focus is on laying a solid foundation for both the backend and frontend systems. During Week 1, the project structure is established using React for the frontend and FastAPI for the backend. This separation of concerns ensures modularity, scalability, and ease of future maintenance. On the backend, database models for users are created to store key information such as user ID, name, email, password hash, role, and department. To ensure data security, user authentication is implemented using JWT, or JSON Web Tokens. This allows users to register and log in safely, with their credentials protected through password hashing and token-based session management.

In Week 2, the development focus shifts toward designing an intuitive and responsive user interface using Tailwind CSS. The interface is crafted to provide a clean, modern, and user-friendly experience. After successful login, each user is redirected to a personalized dashboard displaying their role and department details, which are extracted directly from the JWT payload. Meanwhile, the backend introduces department-wise scoping, ensuring that users can only access data related to their department. This enhances both the security and usability of the system. 

Weeks 3 and 4 — the shout-out posting and feed system. During Week 3, a shout-out creation form is developed on the frontend, allowing users to compose a message, tag recipients they wish to appreciate, and optionally attach an image. When submitted, the shout-out is stored in the database with all essential details, maintaining proper relationships between the sender and the tagged recipients. The database schema for shout-outs includes fields such as message content, sender ID, recipient IDs, timestamp, department, and optional image URLs. This well-structured data design ensures every shout-out is recorded efficiently and remains linked to the relevant users.

In Week 4, Week 4: 
● Display all shout-outs on the feed. 
● Filter by department, sender, date 
● Attachments or image uploads (optional)
1. Show all shout-outs in a scrollable feed with sender, receiver, message, and time.  
2. Add filters: by department (e.g., HR), sender name, and date.  
3. Allow optional image or file uploads with each shout-out.  
4. Store shout-outs in a database with metadata and file URLs.  
5. Display filtered results dynamically based on user selection.
Weeks 5–6 – Reactions & Comments

Week 5:  
This week introduces interactive features to boost user engagement through reactions. On the frontend, each shout-out post is enhanced with buttons for predefined reactions such as like, **clap, and **star. These buttons are designed to be intuitive and visually distinct. When a user reacts, the frontend sends the reaction type and post ID to the backend, which stores the data along with the user ID and timestamp. The backend ensures that each user can react only once per type per post, and allows toggling (e.g., unliking). Reaction counters are updated in real-time using WebSockets or polling, providing a dynamic and responsive experience. This feature not only encourages appreciation but also helps identify popular shout-outs based on community feedback.

Week 6:  
The focus shifts to building a commenting system under each shout-out. Users can now leave comments, reply to others, and engage in threaded discussions. The frontend displays a comment input box and renders each comment with the user’s avatar, name, timestamp, and optionally, nested replies. On the backend, comments are stored with fields such as comment ID, post ID, user ID, parent comment ID (for nesting), content, and timestamp. Moderation logic is implemented to allow users to delete their own comments, while admins can remove inappropriate content. This system fosters meaningful conversations and builds a sense of community around each shout-out.


 Weeks 7–8 – Admin Tools & Analytics

Week 7:  
This week is dedicated to empowering administrators with tools to monitor and manage platform activity. An admin dashboard is developed to display key metrics such as top contributors (users who post the most shout-outs) and most tagged users (those frequently appreciated by others). Admins can view reported shout-outs, investigate flagged content, and take action by deleting posts or comments. Each report includes metadata like reporter ID, reason, and timestamp. This moderation system ensures that the platform remains respectful, inclusive, and aligned with community standards.

Week 8:  
The final week focuses on analytics, reporting, and deployment. Admins gain the ability to export reports in PDF or CSV format, summarizing shout-outs, reactions, and user activity. These reports can be filtered by department, date range, or contributor, making them useful for HR or team leads. A gamified leaderboard is introduced to highlight users who receive the most appreciation, encouraging positive competition and recognition. The project wraps up with deployment to a cloud platform (e.g., Render, Vercel, or AWS), along with final testing, bug fixes, and UI/UX polish. By the end of Week 8, the system is fully functional, secure, and ready for real-world use.
