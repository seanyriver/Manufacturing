import { CollectionState, abstractActionCreators } from "../store/CollectionState";
import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router";
import Material from "../store/Material";
import { actionCreators } from "../store/Material";
import { connect } from "react-redux";
import { ApplicationState } from "../store";
import MaterialListItemView, { MaterialListItemViewProps } from "./MaterialListItemView";
import { ListView, ListViewProps } from "./ListView";
import NewMaterialDialog from "./dialogs/NewMaterialDialog";

class MaterialListView extends ListView<Material> {
    constructor(props: any) {
        super(props);
    }
    render() {
        return super.render();
    }
};

export default withRouter<ListViewProps<Material>>(
    connect( (state: ApplicationState) => Object.assign( {},
        state.materials,
        { itemView: MaterialListItemView, name: "materials", title: "Materials", createDialog: NewMaterialDialog }
    ),
    actionCreators
)(MaterialListView as any) as any) as typeof MaterialListView;
