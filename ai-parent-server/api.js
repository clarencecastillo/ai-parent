const swipl = require('swipl-stdio');

class Parent {

  constructor(engine = new swipl.Engine(), pl_filename = 'prolog/parent') {
    this.engine = engine;
    this.engine.call(`consult(${pl_filename})`);
  }

  async ask(context = 0) {
    return await this.engine.call(`ask(Q, ${context})`).then(r => r['Q']);
  }
}

class Kid {
  constructor(engine = new swipl.Engine(), pl_filename = 'prolog/kid') {
    this.engine = engine;
    this.engine.call(`consult(${pl_filename})`);
  }

  async yes(context) {
    await this.engine.call(`answer(yes, ${context})`);
  }

  async no(context) {
    await this.engine.call(`answer(no, ${context})`);
  }
}


module.exports = {
  Parent: Parent,
  Kid: Kid
};