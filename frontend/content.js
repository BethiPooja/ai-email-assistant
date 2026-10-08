console.log("Email Writer Extension - Content Script Loaded");
let lastGeneratedReply = '';

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]',
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerHTML.trim();
        }
    }
    return '';

}
function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;

}

function createAIButton() {
    const button = document.createElement('button');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('type', 'button');
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;

}
function findComposeBox() {
    const composeBoxes = document.querySelectorAll(
        '[contenteditable="true"][role="textbox"]'
    );
    for (const box of composeBoxes) {
        const rect = box.getBoundingClientRect();

        if (
            rect.width > 0 &&
            rect.height > 0 &&
            box.offsetParent !== null
        ) {
            return box;
        }
    }

    return null;
}



function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) {
        existingButton.remove();
    }

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }
    console.log("Toolbar found,creating AI button");
    const button = createAIButton();
    button.classList.add('ai-reply-button')

    const toneSelect = document.createElement('select');

    toneSelect.className = 'ai-tone-select';
    toneSelect.style.marginRight = '8px';
    toneSelect.style.padding = '4px';

    const tones = [
        { value: 'professional', label: 'Professional' },
        { value: 'friendly', label: 'Friendly' },
        { value: 'formal', label: 'Formal' }
    ];

    tones.forEach(tone => {
        const option = document.createElement('option');

        option.value = tone.value;
        option.textContent = tone.label;

        toneSelect.appendChild(option);
    });


    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();
            console.log("Email content:", emailContent);
            if (!emailContent) {
                alert("No email content found.");
                return;
            }

            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: toneSelect.value
                })

            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Request Failed: ${response.status} ${errorText}`);
            }
            const generatedReply = await response.text();
            console.log("Generated reply:", generatedReply);

            const composeBox = document.querySelector('[contenteditable="true"][role="textbox"]');


            if (!composeBox) {
                throw new Error("Gmail compose box not found.");
            }
            const currentText = composeBox.innerText.trim();
            composeBox.focus();
            if (!currentText) {
                document.execCommand(
                    'insertText',
                    false,
                    generatedReply
                );

            } else if (
                lastGeneratedReply &&
                currentText === lastGeneratedReply.trim()
            ) {
                composeBox.innerText = generatedReply;

            } else {
                const shouldReplace = confirm(
                    "You have edited the current reply. Do you want to replace it with a new AI-generated reply?"
                );

                if (shouldReplace) {
                    composeBox.innerText = generatedReply;
                } else {
                    return;
                }
            }
            composeBox.dispatchEvent(new InputEvent('input', {
                bubbles: true,
                inputType: 'insertText',
                data: generatedReply
            }));

            lastGeneratedReply = generatedReply;
            console.log("Reply inserted successfully.");
        } catch (error) {
            console.error("AI Reply Error:", error);
            alert(`Failed to generate reply: ${error.message}`);
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }

    });

    toolbar.insertBefore(toneSelect, toolbar.firstChild);
    toolbar.insertBefore(button, toneSelect.nextSibling);

}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );
        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});


observer.observe(document.body, {
    childList: true,
    subtree: true
})