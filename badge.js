const git = require('simple-git')(__dirname);
const lineReplace = require('line-replace');

async function main() {
    try {
        // Get the list of remotes and extract the origin's fetch URL
        const remotes = await git.getRemotes(true);
        const originRemote = remotes.find(r => r.name === 'origin')?.refs.fetch;

        if (!originRemote) {
            throw new Error('No "origin" remote found. Ensure your Git repository has a remote named "origin".');
        }

        // Format the remote URL for badge creation
        const formattedRemote = originRemote
            .replace('https://', '')
            .replace('git@', '')
            .replace('.git', '')
            .replace(':', '/');

        // Construct the GitHub Actions badge link
        const badgeMarkdown = `[![GitHub Classroom Workflow](https://${formattedRemote}/actions/workflows/classroom.yml/badge.svg)](https://${formattedRemote}/actions/workflows/classroom.yml)`;

        // Replace line 3 with the badge link in README.md
        lineReplace({
            file: 'README.md',
            line: 3,
            text: badgeMarkdown,
            callback: ({ error }) => {
                if (error) {
                    console.error('Error updating line 3:', error);
                    return;
                }

                // Replace line 8 to mark the assignment task as completed
                lineReplace({
                    file: 'README.md',
                    line: 8,
                    text: `- [x] update the assignment checks above to the correct link. - Done Automatically`,
                    callback: ({ error }) => {
                        if (error) {
                            console.error('Error updating line 8:', error);
                            return;
                        }

                        // Stage and commit changes to the README file
                        git.add(['README.md'])
                            .then(() => git.commit('Update README with GitHub Actions badge and task completion'))
                            .then(() => console.log('README updated and committed successfully.'))
                            .catch(err => console.error('Error committing changes:', err));
                    },
                });
            },
        });
    } catch (err) {
        console.error('Error in main function:', err.message);
    }
}

main();
