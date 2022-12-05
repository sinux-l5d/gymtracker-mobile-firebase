import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { DataService } from "src/app/services/data.service";
import { Exercise, SessionWithDuration } from "src/types/db";

@Component({
  selector: "app-exercices",
  templateUrl: "./exercices.component.html",
  styleUrls: ["./exercices.component.scss"],
})
export class ExercicesComponent implements OnInit {
  @Input()
  id: string = "";

  session?: SessionWithDuration;

  constructor(
    private dataService: DataService,
    private modalCtrl: ModalController,
  ) {}

  updateExercise = (exercise: Exercise) => { // arrow function to preserve `this`
    console.log("(ExercicesComponent) Saving to firebase: ", exercise);
    this.dataService.updateExercise(this.id, exercise);
  };

  addNewExercise() {
    this.dataService.addExercise(this.id, {
      name: "New Exercise",
      note: "",
      repetitions: 0,
      weight: 0,
    });
  }

  ngOnInit() {
    this.dataService.getSessionById(this.id).subscribe((session) => {
      this.session = session;
    });
  }
}
