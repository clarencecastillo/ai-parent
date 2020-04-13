:-['activities.pl'].

answer(yes, Activity):-
  activity(Activity),
  assert(activity_yes(Activity)),
  (retract(current_activity(_)); true),
  assert(current_activity(Activity)).

answer(no, Activity):-
  activity(Activity),
  activity_yes(Activity),
  (retract(current_activity(_)); true).

answer(no, Activity):-
  activity(Activity),
  \+activity_yes(Activity),
  assert(activity_no(Activity)).

answer(yes, Target):-
  current_activity(Activity),
  target_of(Target, Activity),
  assert(target_yes(Target, Activity)),
  (retract(current_target(_)); true),
  assert(current_target(Target)).

answer(no, Target):-
  current_activity(Activity),
  target_of(Target, Activity),
  assert(target_no(Target, Activity)).

answer(yes, Feedback):-
  current_activity(Activity),
  feedback_of(Feedback, Activity),
  current_target(Target),
  assert(feedback_yes(Feedback, Target, Activity)).

answer(no, Feedback):-
  current_activity(Activity),
  feedback_of(Feedback, Activity),
  current_target(Target),
  assert(feedback_no(Feedback, Target, Activity)).
