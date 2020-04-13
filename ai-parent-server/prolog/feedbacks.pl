:- dynamic feedback_yes/3.
:- dynamic feedback_no/3.

%% List of follow up feedback questions for every activity

feedback_lists([
  eat_feedback,
  play_feedback,
  learn_feedback,
  drink_feedback,
  interact_feedback
]).

food_feedbacks([
  feedback_food_salty,
  feedback_food_sweet,
  feedback_food_spicy,
  feedback_food_tasty,
  feedback_food_alot,
  feedback_food_share,
  feedback_food_washed,
  feedback_food_clean
]).

game_feedbacks([
  feedback_game_fun,
  feedback_game_tired,
  feedback_game_enjoy,
  feedback_game_group,
  feedback_game_again,
  feedback_game_meet,
  feedback_game_hurt
]).

subject_feedbacks([
  feedback_subject_easy,
  feedback_subject_enjoy,
  feedback_subject_finish,
  feedback_subject_homework,
  feedback_subject_fun,
  feedback_subject_liked
]).

beverage_feedbacks([
  feedback_beverage_sweet,
  feedback_beverage_cold,
  feedback_beverage_tasty,
  feedback_beverage_alot,
  feedback_beverage_share,
  feedback_beverage_cup
]).

person_feedbacks([
  feedback_person_scared,
  feedback_person_happy,
  feedback_person_surprised,
  feedback_person_talked,
  feedback_person_greet,
  feedback_person_group
]).

%% Placeholders for feedback answers

feedback_answered(Feedback, Target, Activity):-
  feedback_yes(Feedback, Target, Activity);
  feedback_no(Feedback, Target, Activity).
