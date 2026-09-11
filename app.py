from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app) # Enables our frontend to talk to this Python server

# 1. The Knowledge Base (General Tech Support)
faq_data = {
    "How do I reset my password?": "To reset your password, click on 'Forgot Password' on the login screen and follow the instructions sent to your recovery email.",
    "Why is my internet so slow?": "Slow internet can be caused by router issues, multiple active downloads, or ISP throttling. Try restarting your router and disconnecting unused devices.",
    "How do I clear my browser cache?": "Go to your browser settings, find the 'Privacy and Security' section, and select 'Clear browsing data'. Ensure 'Cached images and files' is checked.",
    "My computer won't turn on.": "Check if the power cable is securely plugged in. If it's a laptop, ensure the battery is charged. You can also try holding the power button for 10 seconds to perform a hard reset.",
    "How do I fix a frozen screen?": "Press Ctrl + Alt + Delete (Windows) or Cmd + Option + Esc (Mac) to force quit unresponsive applications. If that fails, hold the power button to restart your computer.",
    "What is the blue screen of death?": "The BSOD indicates a critical system error, usually caused by faulty hardware or outdated drivers. Try restarting your computer in Safe Mode to troubleshoot.",
    "How do I connect to a Bluetooth device?": "Turn on Bluetooth in your device settings, put your accessory in pairing mode, and select it from the list of available devices.",
    # Creator & Identity FAQs
    "Who created you?": "I was created by Ali Sultan.",
    "Who is Ali Sultan?": "Ali Sultan is an AI developer and software engineer.",
    "What is your name?": "I am Tech Support AI, designed to assist with IT and troubleshooting queries.",
    "Hello?": "Hi How can i help you some thing special.",
    "For what purpose you created for ?": "I am a FAQ chabot created for pre given question and their and speccificaly for IT queries.",
}

questions = list(faq_data.keys())
answers = list(faq_data.values())

# 2. Text Preprocessing & NLP Setup
# TfidfVectorizer automatically tokenizes, makes text lowercase, and removes stop words
vectorizer = TfidfVectorizer(stop_words='english')
X_faq = vectorizer.fit_transform(questions)

def get_bot_response(user_query):
    # Convert the user's message into a numerical vector
    user_vec = vectorizer.transform([user_query])
    
    # Calculate cosine similarity between the user message and our FAQ questions
    similarities = cosine_similarity(user_vec, X_faq).flatten()
    
    # Find the question with the highest similarity score
    best_match_index = similarities.argmax()
    best_match_score = similarities[best_match_index]
    
    # If the match score is above a threshold, return the answer
    if best_match_score > 0.2:
        return answers[best_match_index]
    else:
        return "I'm sorry, I don't have an answer for that specific issue in my database. Could you rephrase your question?"

# 3. The API Endpoint
@app.route('/api/chat', methods=['POST'])
def chat():
    user_data = request.json
    user_message = user_data.get("message", "")
    
    if not user_message:
        return jsonify({"response": "Please enter a valid question."})
        
    bot_reply = get_bot_response(user_message)
    return jsonify({"response": bot_reply})

if __name__ == '__main__':
    # Runs the API on local port 5000
    app.run(port=5000, debug=True)
