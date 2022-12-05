import { Component, Input, OnInit } from "@angular/core";
import { Exercise } from "src/types/db";

@Component({
  selector: "app-exercise-card[exercise]", // exercise is an required input
  templateUrl: "./exercise-card.component.html",
  styleUrls: ["./exercise-card.component.scss"],
})
export class ExerciseCardComponent implements OnInit {
  @Input()
  exercise?: Exercise;

  @Input()
  onEdit: (exercise: Exercise) => void = () => {};

  get weight(): string | undefined {
    return this.exercise?.weight.toString();
  }
  set weight(weight: string | undefined) {
    if (!this.exercise || !weight) return;
    const w = parseInt(weight);
    this.exercise.weight = w === NaN ? 0 : w;
    this.updateExercise();
  }

  get note(): string | undefined {
    return this.exercise?.note;
  }
  set note(note: string | undefined) {
    if (!this.exercise || !note) return;
    this.exercise.note = note;
    this.updateExercise();
  }

  get name(): string | undefined {
    return this.exercise?.name;
  }
  set name(name: string | undefined) {
    if (!this.exercise || !name) return;
    this.exercise.name = name;
    this.updateExercise();
  }

  constructor() {}

  updateExercise() {
    if (!this.exercise) return;
    this.onEdit(this.exercise);
  }

  incrementReps(x = 1) {
    if (!this.exercise) return;
    this.exercise.repetitions += x;
    this.updateExercise();
  }

  decrementReps() {
    if (!this.exercise) return;
    this.exercise.repetitions--;
    this.updateExercise();
  }

  ngOnInit() {}
}
