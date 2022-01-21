import * as vscode from 'vscode';
import { Davinci } from './davinci';

export function activate(context: vscode.ExtensionContext) {

	const davinci = new Davinci("");
	const davinciOutput = vscode.window.createOutputChannel("Davinci");

	vscode.window.showInformationMessage("HELLO FROM DAVINCI");

	const disposable = vscode.commands.registerCommand(
		'extension.inline-completion-settings',
		() => {
			vscode.window.showInformationMessage('Show settings');
		}
	);

	context.subscriptions.push(disposable);


	const handleGetCompletions = async( text: string, textContext: string, language: string): Promise<Array<string>> => {
		vscode.window.showInformationMessage("Reteiving Completions");

		const completions = await davinci.complete(text, textContext, language);

		return completions;
	};


	const provider: vscode.InlineCompletionItemProvider<vscode.InlineCompletionItem> = {
		provideInlineCompletionItems: async (document, position, context, token) => {
			const text = document.getText(
				new vscode.Range(position.with(undefined, 0), position)
			);

			let textContext = '';
			
			if (position.line > 1){
				textContext = document.getText(
					new vscode.Range(position.with(0, 0), position)
				);
			}


			davinciOutput.clear();
			if (textContext != '') davinciOutput.appendLine("CONTEXT: \n" + textContext);

			const suggestions: any = [];

			const completions = await handleGetCompletions(
				text,
				textContext,
				document.languageId
				).catch(err => vscode.window.showErrorMessage(err.toString()));

			if (!completions) return [];

			for (let i = 0; i < completions.length; i++) {
				suggestions.push({
				text: text + completions[i],
				trackingId: `Completion ${i}`,
				range: new vscode.Range(position.with(undefined, 0), position)
				});
			}


			return suggestions as any;
		},
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider);

	vscode.window.getInlineCompletionItemController(provider).onDidShowCompletionItem(e => {
		davinciOutput.clear();
		davinciOutput.appendLine("Gave Inline Reccomendation");
	});
}
