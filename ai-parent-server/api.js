const swipl = require('swipl-stdio');

class PrologEntity {

  constructor(pl_filename, engine = new swipl.Engine()) {
    this.engine = engine;
    this.engine.call(`consult(${pl_filename})`);
  }

  async query(command) {
    const q = await this.engine.createQuery(command);
    let list = [];

    try {
      let result;
      while (result = await q.next()) {
        list.push(result);
      }
    } finally {
      await q.close();
    }

    return list;
  }

}

class Parent extends PrologEntity {
  
  constructor(pl_filename = 'prolog/parent') {
    super(pl_filename);
  }
  
  async ask(context = 0) {
    return await this.engine.call(`ask(Q, ${context})`)
      .then(r => r['Q'], err => {});
  }

  async report_feedback(target, activity) {
    return Promise.all([
      this.query(`feedback_yes(F, ${target}, ${activity})`)
        .then(results => results.map(r => ({ name: r['F'], answeredYes: true }))),
      this.query(`feedback_no(F, ${target}, ${activity})`)
        .then(results => results.map(r => ({ name: r['F'], answeredYes: false })))
    ]).then(feedbacks => [].concat.apply([], feedbacks));
  }

  async report_targets(activity) {
    return Promise.all([
      this.query(`target_yes(T, ${activity})`)
        .then(results => Promise.all(
          results.map(async r => ({
            name: r['T'],
            answeredYes: true,
            feedbacks: await this.report_feedback(r['T'], activity)
          }))
        )),
      this.query(`target_no(T, ${activity})`)
        .then(results => results.map(r => ({
          name: r['T'],
          answeredYes: false,
          feedbacks: []
        })))
    ]).then(targets => [].concat.apply([], targets));
  }

  async report() {

    return Promise.all([
      this.query('activity_yes(A)')
        .then(results => Promise.all(
          results.map(async r => ({
            name: r['A'],
            answeredYes: true,
            targets: await this.report_targets(r['A'])
          }))
        )),
      this.query('activity_no(A)')
        .then(results => results.map(r => ({
          name: r['A'],
          answeredYes: false,
          targets: []
        })))
    ]).then(activities => [].concat.apply([], activities));
  }
}

class Kid extends PrologEntity {
  constructor(engine = new swipl.Engine(), pl_filename = 'prolog/kid') {
    super(pl_filename, engine);
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