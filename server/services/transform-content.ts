import { markdownToTxt } from "markdown-to-txt"

function transformMarkdownToText(md) {
    let text = md
    try {
        text = markdownToTxt(md)
    }
    catch(error) {
        console.error('ES transformMarkdownToText: Error while transforming markdown to text.')
        console.error(error)
    }
    return text
}

const transformContent = ({content, from}) => {
    if (from === 'markdown') {
        return transformMarkdownToText(content)
    } else {
        return from
    }
}

export default transformContent