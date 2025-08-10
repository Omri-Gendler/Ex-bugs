
export function BugPreview({ bug }) {
    return <article className="bug-preview">

        {!bug.img ? (
            <img src={`img/bugs/bug${getRandomIntInclusive(1, 9)}.jpg`} alt={bug.title} />
        ) : (
            <img src={bug.img} alt={bug.title} />
        )}
        <p className="title">{bug.title}</p>
        <p>Severity: <span>{bug.severity}</span></p>
        {/* <p className="description">{bug.description}</p> */}
        {/* <p className="created-at">Created at: {new Date(bug.createdAt).toLocaleDateString()}</p> */}
        <p className="status">Status: {bug.isDone ? 'Done' : 'In Progress'}</p>

    </article>
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
