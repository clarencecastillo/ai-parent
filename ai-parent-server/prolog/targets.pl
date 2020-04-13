:- dynamic target_yes/2.
:- dynamic target_no/2.

%% List of follow up target questions for every activity

target_lists([
  food_targets,
  game_targets,
  subject_targets,
  beverage_targets,
  person_targets
]).

food_targets([
  target_food_candy,
  target_food_cake,
  target_food_veggies,
  target_food_sandwich,
  target_food_pizza,
  target_food_chips,
  target_food_hotdog,
  target_food_waffles,
  target_food_fish,
  target_food_rice
]).

game_targets([
  target_game_slides,
  target_game_sandbox,
  target_game_toys,
  target_game_trains,
  target_game_cars,
  target_game_playmat,
  target_game_build,
  target_game_bears,
  target_game_alphabets,
  target_game_numbers
]).

subject_targets([
  target_subject_english,
  target_subject_maths,
  target_subject_science,
  target_subject_alphabets,
  target_subject_numbers,
  target_subject_drawing,
  target_subject_writing,
  target_subject_reading
]).

beverage_targets([
  target_beverage_water,
  target_beverage_milk,
  target_beverage_orange,
  target_beverage_cola,
  target_beverage_strawberry,
  target_beverage_milkshake,
  target_beverage_chocolate
]).

person_targets([
  target_person_police,
  target_person_teacher,
  target_person_friend,
  target_person_cat,
  target_person_dog,
  target_person_doctor,
  target_person_stranger,
  target_person_boy,
  target_person_girl
]).

%% Placeholders for target answers

target_answered(Target, Activity):-
  target_yes(Target, Activity);
  target_no(Target, Activity).
