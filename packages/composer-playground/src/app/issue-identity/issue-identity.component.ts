import { Component, OnInit } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { AlertService } from '../services/alert.service';
import { AdminService } from '../services/admin.service';
import { ConnectionProfileService } from '../services/connectionprofile.service';
import { ClientService } from '../services/client.service';

@Component({
  selector: 'issue-identity-modal',
  templateUrl: './issue-identity.component.html',
  styleUrls: ['./issue-identity.component.scss'.toString()]
})
export class IssueIdentityComponent implements OnInit {

  private issueInProgress: boolean = false;
  private userID: string = null;
  private participantFQI: string = null;
  private participantFQIs: string[] = [];
  private issuer: boolean = false;
  private wallet: boolean = true;

  constructor(
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private adminService: AdminService,
    private clientService: ClientService,
    private connectionProfileService: ConnectionProfileService
  ) {

  }

  ngOnInit(): Promise<any> {
    return this.loadParticipants();
  }

  loadParticipants() {
    let participantRegistries = [];

    return this.clientService.getBusinessNetworkConnection().getAllParticipantRegistries()
      .then((participantRegistries) => {
        return Promise.all(participantRegistries.map((registry) => {
          return registry.getAll();
        }));
      })
      .then((participantArrays) => {
        this.participantFQIs = participantArrays.reduce(
          function(accumulator, currentValue) {
            return accumulator.concat(currentValue.map(
              (participant) => participant.getFullyQualifiedIdentifier())
            );
          },
          []
        );

        this.participantFQIs.sort((a, b) => {
          return a.localeCompare(b);
        });
      })
      .catch((error) => {
        this.alertService.errorStatus$.next(error);
      });
  }

  search = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term === '' ? []
        : this.participantFQIs.filter(v => new RegExp(term, 'gi').test(v)).slice(0, 10));

  private issueIdentity(): void {
    this.issueInProgress = true;

    let businessNetworkConnection = this.clientService.getBusinessNetworkConnection();
    let connectionProfileName = this.connectionProfileService.getCurrentConnectionProfile();

    return this.adminService.getAdminConnection().getProfile(connectionProfileName)
      .then((connectionProfile) => {
        let options = { issuer: this.issuer, affiliation: undefined };
        ['membershipServicesURL', 'peerURL', 'eventHubURL'].forEach((url) => {
          if (connectionProfile[url] && connectionProfile[url].match(/\.blockchain\.ibm\.com/)) {
            // Smells like Bluemix with their non-default affiliations.
            options.affiliation = 'group1';
          }
        });
        return businessNetworkConnection.issueIdentity(this.participantFQI, this.userID, options);
      })
      .then((identity) => {
        this.issueInProgress = false;
        this.activeModal.close(identity);
      })
      .catch((error) => {
        console.log(error);
        this.issueInProgress = false;
        this.activeModal.dismiss(error);
      });
  }
}
