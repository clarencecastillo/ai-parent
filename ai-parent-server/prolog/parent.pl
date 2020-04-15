:-['activities.pl'].

%% CONSTANTS

%% Used to count how many feedback questions can be asked per target
max_feedback_questions(3).

%% Rule to match a random activity from the list of activities
ask_activity(Activity, 0):-
  activities(List),
  random_member(Activity, List).

%% Rule to match an unanswered activity from the list of activities
ask_activity(NextActivity, PrevActivity):-
  activity_answered(PrevActivity),
  activity(NextActivity),
  \+activity_answered(NextActivity).

%% Rule to match the same given activity if the activity has not been answered yet
ask_activity(PrevActivity, PrevActivity):-
  \+activity_answered(PrevActivity).

%% Rule to match a target for activity that has not been answered.
ask_target(Target, Activity):-
  target_of(Target, Activity),
  \+target_answered(Target, Activity).

%% Rule to match feedback for a given target and activity that has not been answered yet
ask_feedback(Feedback, Target, Activity):-
  feedback_of(Feedback, Activity),
  \+feedback_answered(Feedback, Target, Activity).

%% Helper rule to check if the number of feedback given for target is still less than the set limit
can_ask_feedback(Target, Activity):-
  max_feedback_questions(Limit),
  aggregate_all(count, feedback_answered(_, Target, Activity), Count),
  Count < Limit.

%% Rule to initialise the first activity to be asked
ask(Question, 0):-
  ask_activity(Question, 0).

%% Rule to match the next available target given the current activity
ask(Question, Activity):-
  activity_yes(Activity),
  current_activity(Activity),
  ask_target(Question, Activity).

%% Rule to match the next available activity given activity is not the current
ask(Question, Activity):-
  activity_yes(Activity),
  \+current_activity(Activity),
  ask_activity(Question, Activity).

%% Rule to match the next available activity given current activity was replied no
ask(Question, Activity):-
  activity_no(Activity),
  ask_activity(Question, Activity).

%% Rule to match the next available feedback for the current target
ask(Question, Target):-
  current_activity(Activity),
  target_yes(Target, Activity),
  ask_feedback(Question, Target, Activity).

%% Rule to match the next available target given previous target was replied with a no
ask(Question, Target):-
  current_activity(Activity),
  target_no(Target, Activity),
  ask_target(Question, Activity),
  assert(current_target(Question)).

%% Rule to match the next available feedback given previous feedback was answered
ask(Question, Feedback):-
  current_activity(Activity),
  current_target(Target),
  feedback_answered(Feedback, Target, Activity),
  can_ask_feedback(Target, Activity),
  ask_feedback(Question, Target, Activity).

%% Rule to match the current activity given the max number of feedback has already been reached
ask(Question, Feedback):-
  current_activity(Question),
  current_target(Target),
  feedback_answered(Feedback, Target, Question),
  \+can_ask_feedback(Target, Question).
