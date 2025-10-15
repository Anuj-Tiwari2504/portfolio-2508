// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.form-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Show loading state
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline-flex';
    submitBtn.disabled = true;
    
    const formData = new FormData(e.target);
    const messageData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    console.log('Sending message:', messageData);
    
    try {
        const response = await api.sendMessage(messageData);
        console.log('Message sent to backend:', response);
        
        // Success - show proper message
        showSuccessMessage();
        e.target.reset();
        
    } catch (error) {
        console.log('Backend failed, trying direct save:', error);
        
        // Try direct database save
        try {
            const directResponse = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            });
            
            if (directResponse.ok) {
                showSuccessMessage();
                e.target.reset();
                return;
            }
        } catch (directError) {
            console.log('Direct save also failed:', directError);
        }
        
        // Final fallback to localStorage
        const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        const newMessage = {
            id: Date.now().toString(),
            name: messageData.name,
            email: messageData.email,
            subject: messageData.subject,
            message: messageData.message,
            status: 'new',
            createdAt: new Date().toISOString()
        };
        
        messages.push(newMessage);
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        
        showSuccessMessage();
        e.target.reset();
    } finally {
        // Reset button state
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function showSuccessMessage() {
    // Hide the form and show success message
    const form = document.getElementById('contact-form');
    const formContainer = form.parentElement;
    
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        text-align: center;
        padding: 60px 40px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3);
    `;
    
    successDiv.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
        <h3 style="font-size: 2rem; margin-bottom: 15px; font-weight: 700;">Message Submitted!</h3>
        <p style="font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9;">Thank you for reaching out. We will contact you soon.</p>
        <button onclick="resetContactForm()" style="
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid white;
            padding: 12px 30px;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        " onmouseover="this.style.background='white'; this.style.color='#10b981'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.color='white'">Send Another Message</button>
    `;
    
    // Replace form with success message
    formContainer.innerHTML = '';
    formContainer.appendChild(successDiv);
}

function resetContactForm() {
    // Reload the page to reset the form
    location.reload();
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        max-width: 400px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444'};
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}