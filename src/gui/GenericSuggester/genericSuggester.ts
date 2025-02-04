import { App, FuzzySuggestModal } from "obsidian";
import type { FuzzyMatch } from "obsidian";

export default class GenericSuggester extends FuzzySuggestModal<string> {
	private resolvePromise: (value: string) => void;
	private rejectPromise: (reason?: any) => void;
	public promise: Promise<string>;
	private resolved: boolean;

	public static Suggest(app: App, displayItems: string[], items: string[]) {
		const newSuggester = new GenericSuggester(app, displayItems, items);
		return newSuggester.promise;
	}

	public constructor(
		app: App,
		private displayItems: string[],
		private items: string[]
	) {
		super(app);

		this.promise = new Promise<string>((resolve, reject) => {
			this.resolvePromise = resolve;
			this.rejectPromise = reject;
		});

        this.inputEl.addEventListener('keydown', (event :KeyboardEvent) => {
            if (event.code == 'Tab') {
                let complete = ""
                // @ts-ignore
                const divNode = this.chooser.suggestions[this.chooser.selectedItem]
                for (const node of divNode.childNodes) {
                    if (node.nodeName == '#text') {
                        complete += node.textContent
                    } else if (node.nodeName == 'SPAN') {
                        complete += node.innerText
                    }
                }
                this.inputEl.value = complete
            }
        })

		this.open();
	}

	getItemText(item: string): string {
		return this.displayItems[this.items.indexOf(item)];
	}

	getItems(): string[] {
		return this.items;
	}

	selectSuggestion(
		value: FuzzyMatch<string>,
		evt: MouseEvent | KeyboardEvent
	) {
		this.resolved = true;
		super.selectSuggestion(value, evt);
	}

	onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
		this.resolved = true;
		this.resolvePromise(item);
	}

	onClose() {
		super.onClose();

		if (!this.resolved) this.rejectPromise("no input given.");
	}
}
