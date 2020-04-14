const api = require('./api.js');

class Conversation {
    
    constructor(id) {
        this.id = id;
        this.parent = new api.Parent();
        this.kid = new api.Kid(this.parent.engine);
        this.context = undefined;
    }
    
    async handle(message, socket) {
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
        
        this.send(socket);
    }
    
    send(socket) {
        const data = `${this.id}:${this.context}`;
        socket.send(data);
    }
}

module.exports = {
    Conversation: Conversation
};