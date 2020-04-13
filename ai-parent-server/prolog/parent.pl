:-['activities.pl'].

%% CONSTANTS
max_feedback_questions(3).

ask_activity(Activity, 0):-
  activities(List),
  random_member(Activity, List).

ask_activity(NextActivity, PrevActivity):-
  activity_answered(PrevActivity),
  activity(NextActivity),
  \+activity_answered(NextActivity).

ask_activity(PrevActivity, PrevActivity):-
  \+activity_answered(PrevActivity).

ask_target(Target, Activity):-
  target_of(Target, Activity),
  \+target_answered(Target, Activity).

ask_feedback(Feedback, Target, Activity):-
  feedback_of(Feedback, Activity),
  \+feedback_answered(Feedback, Target, Activity).

can_ask_feedback(Target, Activity):-
  max_feedback_questions(Limit),
  aggregate_all(count, feedback_answered(_, Target, Activity), Count),
  Count < Limit.

ask(Question, 0):-
  ask_activity(Question, 0).

ask(Question, Activity):-
  activity_yes(Activity),
  current_activity(Activity),
  ask_target(Question, Activity).

ask(Question, Activity):-
  activity_yes(Activity),
  \+current_activity(Activity),
  ask_activity(Question, Activity).

ask(Question, Activity):-
  activity_no(Activity),
  ask_activity(Question, Activity).

ask(Question, Target):-
  current_activity(Activity),
  target_yes(Target, Activity),
  ask_feedback(Question, Target, Activity).

ask(Question, Target):-
  current_activity(Activity),
  target_no(Target, Activity),
  ask_target(Question, Activity),
  assert(current_target(Question)).

ask(Question, Feedback):-
  current_activity(Activity),
  current_target(Target),
  feedback_answered(Feedback, Target, Activity),
  can_ask_feedback(Target, Activity),
  ask_feedback(Question, Target, Activity).

ask(Question, Feedback):-
  current_activity(Question),
  current_target(Target),
  feedback_answered(Feedback, Target, Question),
  \+can_ask_feedback(Target, Question).
