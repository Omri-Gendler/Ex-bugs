export function BugPreview({bug}) {
    return <article className="bug-preview">
        <p className="title">{bug.title}</p>
        <p>Severity: <span>{bug.severity}</span></p>
        {/* <p className="description">{bug.description}</p> */}
        {/* <p className="created-at">Created at: {new Date(bug.createdAt).toLocaleDateString()}</p> */}
        <p className="status">Status: {bug.isDone ? 'Done' : 'In Progress'}</p>

    </article>
}