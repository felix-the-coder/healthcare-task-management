import math


class FibonacciHeapNode:
    def __init__(self, key, value=None):
        self.key = key
        self.value = value
        self.degree = 0
        self.parent = None
        self.child = None
        self.mark = False
        self.left = self
        self.right = self


class FibonacciHeap:
    def __init__(self):
        self.min_node = None
        self.total_nodes = 0

    def insert(self, key, value=None):
        node = FibonacciHeapNode(key, value)
        if self.min_node is None:
            self.min_node = node
        else:
            self._add_to_root_list(node)
            if node.key < self.min_node.key:
                self.min_node = node
        self.total_nodes += 1
        return node

    def extract_min(self):
        z = self.min_node
        if z is not None:
            if z.child:
                children = [x for x in self._iterate(z.child)]
                for child in children:
                    self._add_to_root_list(child)
                    child.parent = None
            self._remove_from_root_list(z)
            if z == z.right:
                self.min_node = None
            else:
                self.min_node = z.right
                self._consolidate()
            self.total_nodes -= 1
        return z

    def peek_min(self):
        return self.min_node.value if self.min_node else None

    def _add_to_root_list(self, node):
        node.left = self.min_node
        node.right = self.min_node.right
        self.min_node.right.left = node
        self.min_node.right = node

    def _remove_from_root_list(self, node):
        if node.right == node:
            self.min_node = None
        else:
            node.right.left = node.left
            node.left.right = node.right

    def _iterate(self, start):
        current = stop = start
        while True:
            yield current
            current = current.right
            if current == stop:
                break

    def _consolidate(self):
        max_degree = int(math.log(self.total_nodes, 2)) + 1
        degree_table = [None] * max_degree
        nodes = [x for x in self._iterate(self.min_node)]
        for node in nodes:
            d = node.degree
            while degree_table[d]:
                other = degree_table[d]
                if node.key > other.key:
                    node, other = other, node
                self._link(other, node)
                degree_table[d] = None
                d += 1
            degree_table[d] = node
        self.min_node = None
        for node in degree_table:
            if node and (self.min_node is None or node.key < self.min_node.key):
                self.min_node = node

    def _link(self, child, parent):
        self._remove_from_root_list(child)
        child.parent = parent
        if not parent.child:
            parent.child = child
            child.right = child.left = child
        else:
            child.left = parent.child
            child.right = parent.child.right
            parent.child.right.left = child
            parent.child.right = child
        parent.degree += 1
        child.mark = False

    def get_all_nodes(self):
        if not self.min_node:
            return []
        return [node.value for node in self._iterate(self.min_node)]


class TaskPriorityQueue:
    def __init__(self):
        self.heap = FibonacciHeap()
        self.task_map = {}

    def push(self, task):
        key = (task.urgency, task.time_sensitive.timestamp())
        node = self.heap.insert(key, task)
        self.task_map[task.task_id] = node

    def pop(self):
        if not self.heap.min_node:
            raise IndexError("No tasks in the queue")
        min_node = self.heap.extract_min()
        task = min_node.value
        del self.task_map[task.task_id]
        return task

    def peek(self):
        if not self.heap.min_node:
            return None
        return self.heap.peek_min()

    def remove(self, task_id):
        if task_id in self.task_map:
            node = self.task_map[task_id]
            self.heap.decrease_key(node, float('-inf'))  # Move the node to the top
            self.heap.extract_min()  # Remove the node from the heap
            del self.task_map[task_id]
        else:
            raise ValueError(f"Task with ID {task_id} not found in heap")

    def rebuild_heap(self, tasks):
        self.heap = FibonacciHeap()
        self.task_map = {}
        for task in tasks:
            self.push(task)

    def get_all_tasks(self):
        return [{"task_id": node.task_id, "description": node.description, "urgency": node.urgency, "time_sensitive": node.time_sensitive,
                "patient_id": node.patient_id, "status": node.status}
                for node in self.heap.get_all_nodes()]

