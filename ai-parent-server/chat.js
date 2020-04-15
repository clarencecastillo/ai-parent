const api = require('./api.js');

class Conversation {
    
    constructor(id) {
        this.id = id;
        this.parent = new api.Parent();
        this.kid = new api.Kid(this.parent.engine);
        this.context = undefined;
    }
    
    async handle(message, socket) {
        console.log(`[${this.id}] received: ${message}`);
        if (message === 'start') {
            if (!this.context) {
                this.context = await this.parent.ask();
            }
        } else if (['yes', 'no'].includes(message)) {
            
            if (message === 'yes') {
                this.kid.yes(this.context);
            } else if (message === 'no') {
                this.kid.no(this.context);
            }
            
            this.context = await this.parent.ask(this.context);
        }
        
        if (!this.context) {
            console.log(`[${this.id}] finished conversation`);
            this.context = 'report';
        }

        this.send(socket, message);
    }
    
    send(socket, replyTo) {
        console.log(`[${this.id}] sending: ${this.context}`);
        const data = `${this.id}:${this.context}:${replyTo}`;
        socket.send(data);
    }
}

module.exports = {
    Conversation: Conversation
};