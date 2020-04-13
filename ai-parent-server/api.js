class Parent {

  constructor(swipl = require('swipl'), pl_filename = 'prolog/parent') {
    this.swipl = swipl;
    this.swipl.call(`consult(${pl_filename}).`);
  }

  ask(context = 0) {
    return this.swipl.call(`ask(Q, ${context}).`)['Q'];
  }
}

class Kid {
  constructor(swipl = require('swipl'), pl_filename = 'prolog/kid') {
    this.swipl = swipl;
    this.swipl.call(`consult(${pl_filename}).`);
  }

  yes(context) {
    this.swipl.call(`answer(yes, ${context}).`);
  }

  no(context) {
    this.swipl.call(`answer(no, ${context}).`);
  }
}


module.exports = {
  Parent: Parent,
  Kid: Kid
};