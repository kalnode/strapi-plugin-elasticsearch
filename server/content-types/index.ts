import task from "./tasks"
import indexingLog from "./indexing-logs"
import registeredIndex from "./registered-indexes"
import mapping from "./mappings"

export default {
    'task': { schema: task },
    'indexing-log': { schema: indexingLog },
    'registered-index': { schema: registeredIndex },
    'mapping': { schema: mapping }
}
