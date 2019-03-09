import * as React from 'react';
import { connect } from 'react-redux';
import Material, { actionCreators, MaterialState } from '../../store/Material';
import { ApplicationState } from '../../store';
import { isValidElement } from 'react';
import { ClientId } from '../../store/Tools';
import { createBrowserHistory } from 'history';
import AttributeEditor from '../AttributeEditor';

type NewMaterialProps =
    {
        onCancel: () => any
        onComplete: () => any,
        infinitive?: string, // describes what is happening, default is "add a material".
    }
    & MaterialState        // ... state we've requested from the Redux store
    & typeof actionCreators      // ... plus action creators we've requested
    ;

type NewMaterialState = {
    draftId: string;
};

class NewMaterialDialog extends React.Component<NewMaterialProps,NewMaterialState> {
    constructor(props: any) {
        super(props);
        this.sendNotificationEmail = true;
        this.state = {draftId: ""};
    }

    sendNotificationEmail: boolean;

    createMaterial() {
        var draft = this.props.drafts[this.state.draftId];
        if (draft)
            this.props.requestCreateItem(draft, this.state.draftId);
    }

    componentDidMount() {
        var draftId = ClientId();
        this.props.requestCreateDraft({name:"",units:""}, draftId);
        this.state = {draftId};
    }

    componentWillUnmount() {
        this.props.requestClearDraft(this.state.draftId);
    }

    render() {
        var { draftId } = this.state;

        var draft = this.props.drafts[draftId];
        if (!draft)
            return null;

        var { infinitive, errors, creating } = this.props;

        var myErrors = !errors ? undefined : errors[draftId];
        var hasErrors = myErrors && myErrors.length > 0;
        var creatingMaterial = !creating ? undefined : creating[draftId];
        var nameValid = draft.name && draft.name.length > 0;

        if (draft.id)
            return <div className="container mr-2 ml-2 mb-2" style={{ maxWidth: 500 }}>
                <div className='row mt-1'>
                    <div className='h4'>The material was created successfully.</div>
                </div>
                <div className='row mt-3' style={{textAlign:"right"}}>
                    <div className={'ml-1 btn btn-default'} onClick={this.props.onCancel}>OK</div>
                </div>
            </div>;

        return <div className="container mr-2 ml-2 mb-2" style={{ maxWidth: 500 }}>
            <div className='row mt-1'>
                <div className='h4'>Provide details below to {infinitive||"create a new material"}:</div>
            </div>
            <div className='row mt-1'>
                <div className='proptitle mb-1'>Name</div>
                <AttributeEditor type="text" initialValue={draft.name}
                    onChange={(value: any) => { this.props.requestPatchDraft({ name: value }, draftId); }} onCancel={() => { }} />
            </div>
            <div className='row mt-1'>
                <div className='proptitle mb-1'>Units</div>
                <AttributeEditor type="text" initialValue={draft.units}
                    onChange={(value: any) => { this.props.requestPatchDraft({ units: value }, draftId); }} onCancel={() => { }} />
            </div>

            {myErrors && myErrors.length > 0 &&
                <div className='row mt-2 validation-errors' >
                {
                    myErrors.map((error: string) =>
                        <div>{error}</div>
                    )
                }
                </div>
            }
            <div className='row mt-3' style={{textAlign:"right"}}>
                <button className={'ml-1 btn btn-default'}
                    disabled={creatingMaterial}
                    onClick={this.props.onCancel}>Cancel</button>
                <button className={'ml-1 btn btn-primary'}
                    disabled={creatingMaterial || !nameValid}
                    onClick={() => this.createMaterial()}>Create</button>
            </div>
        </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.materials, // Selects which state properties are merged into the component's props
    actionCreators                 // Selects which action creators are merged into the component's props
)(NewMaterialDialog) as typeof NewMaterialDialog;
