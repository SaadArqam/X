# 🧱 Class Diagram – Smart Blog Platform

## Main Classes

### User
- id: number
- name: string
- email: string
- password: string
- role: Role
- createdAt: Date

Methods:
- createPost()
- commentOnPost()
- bookmarkPost()

---

### Post
- id: number
- title: string
- slug: string
- content: string
- summary: string
- status: PostStatus
- authorId: number
- createdAt: Date
- updatedAt: Date

Methods:
- publish()
- updateContent()
- delete()

---

### Comment
- id: number
- content: string
- postId: number
- userId: number
- createdAt: Date

---

### Tag
- id: number
- name: string

---

### Bookmark
- id: number
- userId: number
- postId: number

---

### AIService
Methods:
- generateOutline(title: string)
- rewriteParagraph(text: string)
- generateSummary(content: string)
- suggestTags(content: string)
- analyzeSEO(content: string)

---

## Relationships

User (1) —— (M) Post  
User (1) —— (M) Comment  
Post (1) —— (M) Comment  
Post (M) —— (M) Tag  
User (M) —— (M) Post (Bookmark)


## Class Diagram 

![Class Diagram ](/ClassDiagram.jpg)
