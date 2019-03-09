import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import When from './When';
import FormatButton from './FormatButton';
import { CustomConfig } from './CustomConfig';
import { CleanHTML } from './Tools';

interface Props {
    initialValue: any,
    type?: string,
    onChange: any,
    onCancel: any,
    onInput?: any,
    hints?: string[],
    customConfigs?: CustomConfig[],
    className?: string;
}

export class TextEditor extends React.Component<Props, { cancel: boolean, editor: string, customConfigsActive: { [id: string]: any } }> {
    constructor(props: Props) {
        super(props);
        this.state = {
            cancel: false,
            customConfigsActive: {},
            editor: "content",
        };
        this.hasFocus = false;
        this.prevSelection = undefined;
    }

    get type() {
        // Valid types include notes, text
        return this.props.type || "text";
    }

    get content() {
        return this.type == "text" || this.state.editor == "html" ? this.editor.textContent : this.editor.innerHTML;
    }

    private hasFocus: boolean;
    private prevSelection: any;

    render() {
        var className : string = "noteseditor";
        if (this.props.type == "text")
            className += " noteseditor-text";
        if (this.state.editor == "html" || this.state.editor == "css")
            className += " noteseditor-code";
        if (this.props.className)
            className += " " + this.props.className;

        return <div
            style={{background:"white"}}
            onBlur={() => {
                this.hasFocus = false;
                setTimeout(() => {
                    if (!this.hasFocus)
                        this.onFinish(false, this.content);
                }, 50);
            }}
            onFocus={() => {
                this.hasFocus = true;
            }}
        >
            <div className={className} contentEditable ref={(e) => { this.editor = e; }}
                onFocus={() => {
                    this.hasFocus = true;
                    if (window.getSelection && this.prevSelection) {
                        var sel: Selection;
                        sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(this.prevSelection);
                    }
                    this.prevSelection = undefined;
                }}
                onBlur={() => {
                    this.hasFocus = false;
                    if (window.getSelection) {
                        var sel: Selection;
                        sel = window.getSelection();
                        if (sel.getRangeAt && sel.rangeCount) {
                            this.prevSelection = sel.getRangeAt(0);
                        }
                    }
                }}
                onPaste={e => {
                    // 
                    e.preventDefault();
                    var html = e.clipboardData.getData("text/html");
                    if (html) {
                        var elem = document.createElement("div");
                        document.execCommand("insertHTML", false, CleanHTML(html));
                    }
                    else {
                        var txt = e.clipboardData.getData("text/plain");
                        if (txt)
                            document.execCommand("insertText", false, txt);
                    }
                    this.props.onInput && this.props.onInput(e.currentTarget.textContent);
                }}
                    onKeyDown={
                        (e) => {
                            if (e.keyCode == 0x1b) {
                                this.onFinish(true);
                            }
                            else if (e.keyCode == 0x0d && this.type == "text") {
                                this.onFinish(false, this.content);
                            }
                            else
                                this.props.onInput && this.props.onInput();
                        }
                }
                onKeyUp={
                    (e) => {
                        // The text will have changed when the keystroke completes.
                        // TODO Adding this breaks the typical view.
                        // We may want to have another callback.
                        //if (e.keyCode != 0x1b && (e.keyCode != 0x0d || this.type != "text"))
                            //this.props.onChange && this.props.onChange(e.currentTarget.textContent);
                    }
                }
                onMouseDown={(e) => { e.stopPropagation(); }} />
                {this.getFormatBar()}
            {this.getCustomFormatBar()}
            {
                this.props.hints && this.props.hints.length > 0 && this.hasFocus &&
                <div>hello world</div>
            }
        </div>;
    }

    getFormatBar() {
        if (this.type != "notes" && this.type != "template")
            return null;

        return <div tabIndex={1} className="formatbar"
            onFocus={() => { this.hasFocus = true; }}
            onBlur={() => {
                this.hasFocus = false;
            }} >
            <When c={this.state.editor == "content"}>
            <FormatButton command='bold' title="Bold"><i className="glyphicon glyphicon-bold" /></FormatButton>
            <FormatButton command='italic' title="Italic"><i className="glyphicon glyphicon-italic" /></FormatButton>
            <FormatButton command='underline' title="Underline"><span style={{ fontSize: "1.5rem", lineHeight: "1.5rem", textDecoration: "underline", padding: 0 }}>U</span></FormatButton>
            <FormatButton command='insertUnorderedList' title="Insert Bullet List"><i className="glyphicon glyphicon-list" /></FormatButton>
            <FormatButton command='insertOrderedList' title="Insert Numbered List"><span style={{background: "white", marginLeft: -1, marginTop: 2, lineHeight: "4pt", fontSize: "5pt", position: "absolute", zIndex: 4}}>1<br/>2<br/>3</span><i className="glyphicon glyphicon-list" /></FormatButton>
            <FormatButton command='increaseFontSize' title="Increase Font Size"><span style={{ fontSize: "1.7rem", lineHeight: "1.5rem", textDecoration: "underline", padding: 0 }}>A</span></FormatButton>
            <FormatButton command='decreaseFontSize' title="Decrease Font Size"><span style={{ fontSize: "1.3rem", lineHeight: "1.5rem", textDecoration: "underline", padding: 0 }}>A</span></FormatButton>
            {
                !this.props.customConfigs ? null :
                    this.props.customConfigs.map((cfg) => {
                        return <FormatButton key={cfg.id} title={cfg.title} label={cfg.label}
                            selected={cfg.id && this.state.customConfigsActive[cfg.id]}
                            onClick={() => {
                                if (!cfg.id)
                                    return;

                                var ccActive: any = {}; // JSON.parse(JSON.stringify(this.state.customConfigsActive));
                                ccActive[cfg.id] = !this.state.customConfigsActive[cfg.id];
                                this.setState({ customConfigsActive: ccActive });
                            }}>
                            {!cfg.iconSuffix ? null : <i className={"glyphicon glyphicon-" + cfg.iconSuffix} />}
                        </FormatButton>;
                    })
            }
            </When>
            <When c={this.props.type == "template"}>
                <When c={this.state.editor != "content"}><FormatButton label="Content" onClick={() => {
                    this.updateEditorContent(this.editor.textContent, true);
                    this.setState({ editor: "content" });
                }} /></When>
                <When c={this.state.editor != "html"}><FormatButton label="HTML" onClick={() => {
                    this.updateEditorContent(this.editor.innerHTML, false);
                    this.setState({ editor: "html" });
                }} /></When>
                <When c={this.state.editor != "css" && false}><FormatButton label="CSS" onClick={() => {
                    this.updateEditorContent(this.editor.innerHTML, false);
                    this.setState({ editor: "css" });
                }} /></When>
            </When>
        </div>;
    }

    getCustomFormatBar() {
        if (this.type != "notes" && this.type != "template")
            return null;

        return <div tabIndex={1} className="formatbar formatbar-sub"
                onFocus={() => { this.hasFocus = true; }}
                onBlur={() => {
                    this.hasFocus = false;
            }} >
            {
                !this.props.customConfigs ? null :
                    this.props.customConfigs.map((customConfig) => {
                        if (customConfig.id && this.state.customConfigsActive[customConfig.id]) {
                            var Cpt = customConfig.component;
                            if (Cpt)
                                return <Cpt {...customConfig.componentProps} onRefocus={() => {
                                    this.editor && this.editor.focus();
                                }} key={customConfig.id } />;
                            }
                        })
                }
        </div>;
    }

    onFinish(cancel: boolean, value?: string) {
        if (!cancel) {
            this.props.onChange && this.props.onChange(value);
        }
        else {
            this.setState({ cancel: true });
            this.props.onCancel && this.props.onCancel();
        }
    }

    private editor: any;

    componentDidMount() {
        this.updateEditorContent(this.props.initialValue);
    }

    updateEditorContent(value: string, html?: boolean) {
        if (!this.editor)
            return;

        if (html == undefined)
            html = this.type == "notes" || this.type == "template";

        this.prevSelection = undefined;
        this.editor.focus();
        if (html)
            this.editor.innerHTML = value || "";
        else
            this.editor.textContent = value || "";
    }
};

