// DOM Elements
const messageTextarea = document.getElementById("messageTextarea")
const sendButton = document.getElementById("sendBtn")
const chatMessages = document.getElementById("chatMessages")
const suggestedPrompts = document.getElementById("suggestedPrompts")
const wordCount = document.getElementById("wordCount")
const newChatBtn = document.getElementById("newChatBtn")
const sidebarToggle = document.getElementById("sidebarToggle")
const sidebar = document.getElementById("sidebar")
const promptCards = document.querySelectorAll(".prompt-card")
const sessionItems = document.querySelectorAll(".session-item")

// State
let currentMessage = ""
let isTyping = false

// Event Listeners
messageTextarea.addEventListener("input", handleTextareaInput)
messageTextarea.addEventListener("keydown", handleKeyDown)
sendButton.addEventListener("click", handleSend)
newChatBtn.addEventListener("click", handleNewChat)
sidebarToggle.addEventListener("click", toggleSidebar)

// Prompt cards
promptCards.forEach((card) => {
  card.addEventListener("click", () => {
    const prompt = card.dataset.prompt
    messageTextarea.value = prompt
    currentMessage = prompt
    autoResizeTextarea(messageTextarea)
    updateSendButtonState()
    updateWordCount()
    hideSuggestedPrompts()
  })
})

// Session items
sessionItems.forEach((item) => {
  item.addEventListener("click", () => {
    sessionItems.forEach((i) => i.classList.remove("active"))
    item.classList.add("active")
  })
})

// Auto-resize textarea function
function autoResizeTextarea(textarea) {
  textarea.style.height = "auto"
  const newHeight = Math.min(textarea.scrollHeight, 120)
  textarea.style.height = newHeight + "px"
}

function handleTextareaInput(event) {
  currentMessage = event.target.value
  autoResizeTextarea(event.target)
  updateSendButtonState()
  updateWordCount()
}

function handleKeyDown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault()
    handleSend()
  } else if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

async function handleSend() {
  if (currentMessage.trim() && !isTyping) {
    const message = currentMessage.trim()

    addMessage(message, "user")

    messageTextarea.value = ""
    messageTextarea.style.height = "20px"
    currentMessage = ""
    updateSendButtonState()
    updateWordCount()
    hideSuggestedPrompts()

    isTyping = true

    const typingGroup = document.createElement("div")
    typingGroup.className = "message-group ai-message typing"
    typingGroup.innerHTML = `
      <div class="message-avatar">
        <div class="avatar-ai">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </div>
      </div>
      <div class="message-content">
        <div class="message-header">
          <span class="message-sender">Cotherapy AI</span>
          <span class="message-time">Typing...</span>
        </div>
        <div class="message-text">
          <p class="typing-indicator">●●●</p>
        </div>
      </div>
    `
    chatMessages.appendChild(typingGroup)
    scrollToBottom()

    try {
      // Send message to FastAPI
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      })

      const data = await response.json()
      chatMessages.removeChild(typingGroup)
      addMessage(data.response, "ai")
    } catch (error) {
      chatMessages.removeChild(typingGroup)
      addMessage("⚠️ Something went wrong. Please try again later.", "ai")
    }

    isTyping = false
  }
}

function addMessage(text, sender) {
  const messageGroup = document.createElement("div")
  messageGroup.className = `message-group ${sender}-message`

  const avatar = document.createElement("div")
  avatar.className = "message-avatar"

  const avatarInner = document.createElement("div")
  avatarInner.className = sender === "ai" ? "avatar-ai" : "avatar-user"

  avatarInner.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="${sender === "ai" ? "M9 12l2 2 4-4" : "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}"></path>
      <circle cx="12" cy="12" r="10"></circle>
    </svg>
  `
  avatar.appendChild(avatarInner)

  const messageContent = document.createElement("div")
  messageContent.className = "message-content"

  const messageHeader = document.createElement("div")
  messageHeader.className = "message-header"
  messageHeader.innerHTML = `
    <span class="message-sender">${sender === "ai" ? "Cotherapy AI" : "Maxwell"}</span>
    <span class="message-time">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
  `

  const messageText = document.createElement("div")
  messageText.className = "message-text"
  messageText.innerHTML = `<p>${text}</p>`

  const messageActions = document.createElement("div")
  messageActions.className = "message-actions"

  if (sender === "ai") {
    messageActions.innerHTML = `
      <button class="action-btn" title="Copy message">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      <button class="action-btn" title="Regenerate response">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
          <path d="M3 21v-5h5"></path>
        </svg>
      </button>
    `
  }

  messageContent.appendChild(messageHeader)
  messageContent.appendChild(messageText)
  messageContent.appendChild(messageActions)

  messageGroup.appendChild(avatar)
  messageGroup.appendChild(messageContent)

  chatMessages.appendChild(messageGroup)
  scrollToBottom()
}

function updateSendButtonState() {
  sendButton.disabled = !currentMessage.trim() || isTyping
}

function updateWordCount() {
  const words = currentMessage.trim().split(/\s+/).filter(word => word.length > 0)
  wordCount.textContent = `${words.length} word${words.length !== 1 ? "s" : ""}`
}

function hideSuggestedPrompts() {
  suggestedPrompts.style.display = "none"
}

function showSuggestedPrompts() {
  suggestedPrompts.style.display = "grid"
}

function handleNewChat() {
  chatMessages.innerHTML = `
    <div class="message-group ai-message">
      <div class="message-avatar">
        <div class="avatar-ai">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </div>
      </div>
      <div class="message-content">
        <div class="message-header">
          <span class="message-sender">Cotherapy AI</span>
          <span class="message-time">Now</span>
        </div>
        <div class="message-text">
          <p>Hello! I'm here to provide a safe, supportive space for you. What would you like to talk about today?</p>
        </div>
      </div>
    </div>
  `
  showSuggestedPrompts()
}

function toggleSidebar() {
  sidebar.classList.toggle("open")
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight
}

document.addEventListener("DOMContentLoaded", () => {
  updateSendButtonState()
  updateWordCount()

  document.addEventListener("click", (e) => {
    if (e.target.closest(".action-btn")) {
      const btn = e.target.closest(".action-btn")
      const title = btn.getAttribute("title")

      if (title === "Copy message") {
        const messageText = btn.closest(".message-content").querySelector(".message-text p").textContent
        navigator.clipboard.writeText(messageText)
        btn.style.color = "var(--primary-green)"
        setTimeout(() => {
          btn.style.color = ""
        }, 1000)
      }
    }
  })
})
