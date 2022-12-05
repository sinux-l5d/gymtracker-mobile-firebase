import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { SessionsPageRoutingModule } from "./sessions-routing.module";

import { SessionsPage } from "./sessions.page";
import { ExercicesComponent } from "src/app/modals/exercices/exercices.component";
import { ExerciseCardComponent } from "src/app/components/exercise-card/exercise-card.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SessionsPageRoutingModule,
  ],
  declarations: [SessionsPage, ExercicesComponent, ExerciseCardComponent],
})
export class SessionsPageModule {}
