const api = require('./api.js');

class Conversation {
    
    constructor(id) {
        this.id = id;
        this.parent = new api.Parent();
        this.kid = new api.Kid(this.parent.swipl);
        this.context = undefined;
    }
    
    handle(message, socket) {
        if (message === 'start') {
            this.context = this.parent.ask();
        } else {
            
            if (message === 'yes') {
                this.kid.yes(this.context);
            } else if (message === 'no') {
                this.kid.no(this.context);
            }
            
            this.context = this.parent.ask(this.context);
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