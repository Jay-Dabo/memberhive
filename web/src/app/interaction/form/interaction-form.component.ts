import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { MdButtonToggleChange } from '@angular/material';

import * as app from '../../app.store';
import {
    AuthService,
    ContextButton,
    SetContextButtonsAction,
    Interaction,
    Person,
    TitleService,
    AddInteractionAction,
    UpdateInteractionAction
} from 'mh-core';

@Component({
  selector: 'mh-interaction-form',
  templateUrl: './interaction-form.component.html',
  styleUrls: ['./interaction-form.component.scss', '../interaction-common.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractionFormComponent implements OnInit, OnDestroy {

  private _alive: boolean = true;
  private _authorId: string;
  private _refPerson: Person;

  form: FormGroup;
  refInteraction: Interaction;

  showTypeSelector: boolean = false;
  submitted: boolean = false;
  editMode: boolean = false;
  error: string;

  people$: Observable<Person[]>;
  options: any = {};
  visibility: any[] = [];
  actionVerbs: any[] = [];

  constructor(titleService: TitleService,
              private _fb: FormBuilder,
              private _auth: AuthService,
              private _store: Store<app.AppState>,
              private _route: ActivatedRoute,
              private _location: Location) {
    titleService.setTitle('Create Interaction');
    this.people$ = this._store.select(app.getPeople);
    this._store.select(app.getSelectedPerson)
        .takeWhile(() => this._alive)
        .subscribe((p: Person) => this._refPerson = p);

    // TODO: move these to settings
    this.options = {
      interaction: {
        types: [
          {type: 'interaction', iconString: 'swap_vertical_circle'},
          {type: 'note', iconString: 'comment'},
          {type: 'meeting', iconString: 'forum'},
          {type: 'email', iconString: 'email'},
          {type: 'phone', iconString: 'contact_phone'}
        ]
      }
    };

    // TODO: fetch these from the auth groups DB
    this.visibility = [
        {id: 'PRIVATE', text: 'Only Me', icon: 'lock'},
        {id: 'SHEPHERD', text: 'Shepherds', icon: 'group'},
        {id: 'LEADER', text: 'Leaders', icon: 'group'},
        {id: 'STAFF', text: 'Staff', icon: 'group'},
        {id: 'ALL', text: 'Users', icon: 'person'}
    ];

    this.actionVerbs = ['call', 'meet', 'follow up', 'schedule', 'do', 'check'];

    this._authorId = this._auth.getPersonId();
  }

  ngOnInit(): void {
        this.form = this._fb.group({
            text: [undefined, [<any>Validators.required]],
            type: [undefined, [<any>Validators.required]],
            actionType: [undefined],
            owner: [undefined, [<any>Validators.required]],
            recipients: [undefined],
            dueOn: [undefined],
            visibility: ['LEADER', [<any>Validators.required]]
        });
        this.initDefaults();
  }

  ngOnDestroy(): void {
    this._alive = false;
  }

  toggleTypes(event: MdButtonToggleChange): void {
      const actionTypeCtrl: any = (<any>this.form).get('type');
      const recipientsCtrl: any = (<any>this.form).get('recipients');
      const ownerCtrl: any = (<any>this.form).get('owner');
      if (actionTypeCtrl.value === 'interaction') {
          actionTypeCtrl.setValidators(<any>Validators.required);
          recipientsCtrl.setValidators(<any>Validators.required);
          ownerCtrl.setValidators(undefined);

      } else {
          actionTypeCtrl.setValidators(undefined);
          recipientsCtrl.setValidators(undefined);
          ownerCtrl.setValidators(<any>Validators.required);
      }
      actionTypeCtrl.updateValueAndValidity();
      recipientsCtrl.updateValueAndValidity();
  }

  returnRoute(): void {
    this._location.back();
  }

  clearForm(): void {
    this.form.reset();
    this.showTypeSelector = false;
    this.initDefaults();
  }

  save(model: Interaction, isValid: boolean): void {
    if (isValid) {
      model.author.id = this._authorId;
      if (!this.editMode) {
          this._store.dispatch(new AddInteractionAction(model));
      } else {
          model.uid = this.refInteraction.uid;
          this._store.dispatch(new UpdateInteractionAction(model));
      }
      this.form.reset();
      this.returnRoute();
    }
  }

  private initDefaults(): void {
    const id: string = this._route.snapshot.paramMap.get('id');
    if (id) {
      this._store.select(app.getInteractions)
        .take(1)
        .subscribe((interaction: Interaction[]) => {
          this.refInteraction = interaction.filter((i: Interaction) => i.uid === id)[0];
          this.form.get('owner').setValue(this.refInteraction.refId);
          this.form.get('text').setValue(this.refInteraction.text);
          this.form.get('type').setValue(this.refInteraction.type);
          this.form.get('recipients').setValue(this.refInteraction.recipients);
          this.editMode = true;
        });
    }

    // person related interaction
    if (this._refPerson && this._refPerson !== undefined) {
      this.form.get('owner').setValue(this._refPerson.uid);
    }
  }

  private _setContextMenu(): void {
    let buttons: ContextButton[] = [];
    buttons.push({icon: 'people', link: '/person', title: 'LIST PEOPLE'});
    this._store.dispatch(new SetContextButtonsAction(buttons));
  }

}