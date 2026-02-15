# 🗄️ ER Diagram – Smart Blog Platform

## Entities

### User
- id (PK)
- name
- email (unique)
- password
- role
- created_at

---

### Post
- id (PK)
- title
- slug (unique)
- content
- summary
- status
- author_id (FK → User.id)
- created_at
- updated_at

---

### Comment
- id (PK)
- content
- user_id (FK → User.id)
- post_id (FK → Post.id)
- created_at

---

### Tag
- id (PK)
- name (unique)

---

### PostTag (Join Table)
- post_id (FK → Post.id)
- tag_id (FK → Tag.id)
PRIMARY KEY (post_id, tag_id)

---

### Bookmark
- id (PK)
- user_id (FK → User.id)
- post_id (FK → Post.id)

---

### Like
- id (PK)
- user_id (FK → User.id)
- post_id (FK → Post.id)

---

## Relationships

User 1 — M Post  
User 1 — M Comment  
Post 1 — M Comment  
Post M — M Tag (via PostTag)  
User M — M Post (via Bookmark)  
User M — M Post (via Like)


## ER Diagram 

![ER Diagram ](/Er_Diagram.jpg)