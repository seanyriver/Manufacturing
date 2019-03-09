import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CustomConfig } from './CustomConfig';
import { CleanHTML, GetValueAsText } from './Tools';
import SearchBar from './SearchBar';
import { addEventListener } from 'history/DOMUtils';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import { AddressState, actionCreators, Address, getDraftAddressId } from '../store/Address';
import { withRouter } from 'react-router';
import { AddressValue } from '../store/Value';
import { PureComponent, MouseEvent, ChangeEvent } from 'react';

type Props = {
    initialValue: Address,
    type?: string,
    immediate?: boolean,
    onChange: any,
    onCancel: any,
    onInput?: any,
    disabled?: boolean,
    customConfigs?: CustomConfig[],
} & AddressState & Partial<typeof actionCreators>;

type State = {
    cancel: boolean,
    editor: string,
    customConfigsActive: { [id: string]: any },
}

class Editor2 extends PureComponent<any> {
    render() {
        var { maxWidth, assign } = this.props;

        return <input type='text' style={{ marginBottom: 5, maxWidth: maxWidth }} className='form-control' {...this.props} />;
    }
}

var Editor = (props: any) => <input type='text' ref={(e: HTMLInputElement) => {
    e && (e.value = props.seed||"");
}} style={{ marginBottom: 5, maxWidth: props.maxWidth }}
    className='form-control' {...props} />;

class AddressEditor extends React.Component<Props,State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            cancel: false,
            customConfigsActive: {},
            editor: "content",
        };

        this.draftId = getDraftAddressId();
        if (!this.props.immediate) {
            this.props.requestSetDraft && this.props.requestSetDraft(this.draftId, this.props.initialValue);
        }
    }

    draftId: string;

    componentDidMount() {
    }

    render() {
        var iv = this.props.initialValue || {};
        var { items, disabled } = this.props;
        var myItems = !items ? [] : items[this.draftId] || [];
        var doingSearch = (myItems && this.props.search && this.props.search != "" && myItems.length > 0 );

        // In immediate mode, we call onChange.  Otherwise we patch the draft, and then
        // the Ok button will call the onChange callback.
        var patch = (address: Address) =>
            this.props.immediate ? this.props.onChange(address) :
            (this.props.requestPatchDraft && this.props.requestPatchDraft(this.draftId, address));

        var draft =
            this.props.immediate ? this.props.initialValue :
            (this.props.drafts || {})[this.draftId] || {};

        return <div> { !disabled &&
            <SearchBar className='searchbar-address' doSearch={(search: string) => {
                this.props.requestSearchAddresses &&
                    this.props.requestSearchAddresses(this.draftId, search);
            }} />} {doingSearch && <span className='addresscancel' onClick={() => {
                {
                    this.props.requestClearAddressSearch && this.props.requestClearAddressSearch(this.draftId);
                }
            }}>cancel</span>}
            <br />
            {doingSearch &&
                <div className='addressbox-wrapper'>
                    <div className='addressbox'>
                        {
                            myItems.map(value => <div className='addressitem'
                            onClick={() => {
                                if (this.props.immediate)
                                    this.props.onChange && this.props.onChange(value);
                                else if (this.props.requestSetDraft)
                                    this.props.requestSetDraft(this.draftId, value);

                                this.props.requestClearAddressSearch && this.props.requestClearAddressSearch(this.draftId);
                            }}
                            >{GetValueAsText({ type: "address", value } as AddressValue)}</div>)
                        }
                    </div>
                </div>
            }
            <div className='input-group'>
                <Editor placeholder='house' disabled={disabled} maxWidth={90} onChange={(e: React.FormEvent<HTMLInputElement>) => patch({ property: e.currentTarget.value })} seed={draft.property} />
                <Editor placeholder='street' disabled={disabled} maxWidth={200} onChange={(e: React.FormEvent<HTMLInputElement>) => patch({ street: e.currentTarget.value })} seed={draft.street} />
            </div>
            <Editor placeholder='line 3' disabled={disabled} maxWidth={290} onChange={(e: React.FormEvent<HTMLInputElement>) => patch({ line3: e.currentTarget.value })} seed={draft.line3} />
            <Editor placeholder='city/town' disabled={disabled} maxWidth={290} onChange={(e: React.FormEvent<HTMLInputElement>) => patch({ city: e.currentTarget.value })} seed={draft.city} />
            <div className='input-group'>
                <Editor placeholder='country' disabled={disabled} maxWidth={200} onChange={(e: React.FormEvent<HTMLInputElement>) => patch({ country: e.currentTarget.value })} seed={draft.country} />
                <Editor placeholder='postcode' disabled={disabled} maxWidth={90} onChange={(e: React.FormEvent<HTMLInputElement>) => patch({ postcode: e.currentTarget.value })} seed={draft.postcode} />
            </div>
            {!this.props.immediate && <br />}
            {!this.props.immediate && <span className='btn btn-sm mt-h btn-default' onClick={() => { this.props.onCancel(); }}>Cancel</span>}
            {!this.props.immediate && <span className='btn btn-sm ml-h mt-h btn-success' onClick={() => this.props.onChange(draft)}><i className='glyphicon glyphicon-ok' /></span> }
        </div>;
    }
};

export default connect(
    (state: ApplicationState) => state.addresses, // Users which state properties are merged into the component's props
    actionCreators,
)(AddressEditor) as typeof AddressEditor;


