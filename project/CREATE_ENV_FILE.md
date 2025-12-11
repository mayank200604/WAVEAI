# 🚀 Create .env File for Wave AI

## Quick Setup (1 minute)

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Or create manually**:
   - Create a new file named `.env` in the project root
   - Copy all contents from `.env.example` into `.env`

## ✅ Your .env file is already configured with:

- ✅ **Firebase Configuration** (matches your project)
- ✅ **GROQ API Key** for AI chatbot
- ✅ **Gemini API Keys** (primary + backup)
- ✅ **Perplexity API Key** for enhanced AI
- ✅ **GitHub Token** for project features
- ✅ **News API** for content features

## 🎯 After creating .env file:

1. **Restart the dev server**:
   ```bash
   npm run dev
   ```

2. **Check console** - should show:
   ```
   ✅ Firebase initialized successfully
   ✅ API Key available: true
   ```

3. **Test authentication** - both email and Google sign-in should work

## 🔒 Security Note:

The `.env` file is already in `.gitignore` - your API keys will not be committed to version control.

---

**All API keys from your backend are already configured in .env.example - just copy it to .env and you're ready to go!**
