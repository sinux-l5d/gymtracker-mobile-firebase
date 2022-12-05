import { Component, OnInit } from "@angular/core";
import { Timestamp } from "@angular/fire/firestore";
import { AlertController, ModalController } from "@ionic/angular";
import { ExercicesComponent } from "src/app/modals/exercices/exercices.component";
import { DataService } from "src/app/services/data.service";
import { NewSession, Session, SessionWithDuration } from "src/types/db";

@Component({
  selector: "app-sessions",
  templateUrl: "./sessions.page.html",
  styleUrls: ["./sessions.page.scss"],
})
export class SessionsPage implements OnInit {
  sessions: SessionWithDuration[] = [];
  constructor(
    private dataService: DataService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
  ) {}

  async openSession(session: Session) {
    const modal = await this.modalCtrl.create({
      component: ExercicesComponent,
      componentProps: {
        id: session.id,
      },
      breakpoints: [0, 0.5, 0.8, 1],
      initialBreakpoint: 0.5,
    });
    await modal.present();
  }

  createAlert(
    header: string,
    roleChanging: string,
    callback: (session: NewSession & { duration: number }) => void,
    defaults?: { name: string; location: string; duration: string },
  ) {
    return this.alertCtrl.create({
      header,
      inputs: [
        {
          name: "name",
          placeholder: "Goal of this session",
          type: "text",
          value: defaults?.name,
        },
        {
          name: "location",
          placeholder: "Where is it happening?",
          type: "text",
          value: defaults?.location,
        },
        { // default to 1 hour
          name: "duration",
          type: "time",
          value: defaults?.duration ?? "01:00",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: roleChanging,
          handler: (res) => {
            // duration is formated as hh:mm
            // convert it to milliseconds
            const duration: number = res.duration.split(":").reduce(
              (acc: number, cur: string, i: number) => {
                return acc + parseInt(cur) * 60 ** (2 - i);
              },
              0,
            ) * 1000;

            const now = Date.now();
            console.log(new Date(now));
            const session: NewSession & { duration: number } = {
              name: res.name,
              startAt: Timestamp.fromDate(new Date(now)),
              endAt: Timestamp.fromDate(new Date(now + duration)),
              location: res.location,
              duration,
            };
            callback(session);
          },
        },
      ],
    });
  }

  async addSession() {
    const alert = await this.createAlert(
      "Add a session",
      "Add",
      (sessionWithDuration) => {
        // remove duration
        const session: NewSession = {
          name: sessionWithDuration.name,
          startAt: sessionWithDuration.startAt,
          endAt: sessionWithDuration.endAt,
          location: sessionWithDuration.location,
        };

        this.dataService.addSession(session);
      },
    );
    await alert.present();
  }

  async editSession(session: Session) {
    // duration is stored at HH:mm. We need to create it from startAt and endAt
    const duration: string = new Date(
      session.endAt.toMillis() - session.startAt.toMillis(),
    ).toISOString().split("T")[1].substring(0, 5);

    const alert = await this.createAlert(
      "Edit a session",
      "Edit",
      (partialSession) => {
        this.dataService.updateSession(session.id, {
          name: partialSession.name,
          location: partialSession.location,
          endAt: Timestamp.fromDate(
            new Date(session.startAt.toMillis() + partialSession.duration),
          ),
        });
      },
      {
        name: session.name,
        location: session.location,
        duration,
      },
    );
    await alert.present();
  }

  deleteSession({ id }: Session) {
    this.dataService.deleteSession(id);
  }

  ngOnInit() {
    this.dataService.getSessions().subscribe((sessions) => {
      sessions.sort((a, b) => -a.startAt.toMillis() + b.startAt.toMillis());
      this.sessions = sessions;
    });
    this.sessions[0]?.endAt.toDate();
  }
}
