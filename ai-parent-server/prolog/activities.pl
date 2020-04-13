:-['targets.pl'].
:-['feedbacks.pl'].

:- dynamic activity_yes/1.
:- dynamic activity_no/1.

%% List of activities
activities([
  activity_eat,
  activity_play,
  activity_learn,
  activity_drink,
  activity_interact
]).

%% Relating each activity to their target list List
targets_of(List, activity_eat):-
  food_targets(List).
targets_of(List, activity_play):-
  game_targets(List).
targets_of(List, activity_learn):-
  subject_targets(List).
targets_of(List, activity_drink):-
  beverage_targets(List).
targets_of(List, activity_interact):-
  person_targets(List).

%% Relating each activity to their feedback list List
feedbacks_of(List, activity_eat):-
  food_feedbacks(List).
feedbacks_of(List, activity_play):-
  game_feedbacks(List).
feedbacks_of(List, activity_learn):-
  subject_feedbacks(List).
feedbacks_of(List, activity_drink):-
  beverage_feedbacks(List).
feedbacks_of(List, activity_interact):-
  person_feedbacks(List).

activity(Activity):-
  activities(List), member(Activity, List).

%% Utilities to get reference of individual target Target of an activity Activity
target_of(Target, Activity):-
  targets_of(List, Activity),
  member(Target, List).

feedback_of(Feedback, Activity):-
  feedbacks_of(List, Activity),
  member(Feedback, List).

%% Placeholders for activity answers

activity_answered(Activity):-
  activity_yes(Activity);
  activity_no(Activity).
