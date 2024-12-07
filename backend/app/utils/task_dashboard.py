from dash import Dash, html, dcc
from dash.dependencies import Input, Output
import pandas as pd
import plotly.express as px
import dash_bootstrap_components as dbc
import requests
import dash_table

def create_dash_app(server):
    """Create and configure the Dash application."""
    dash_app = Dash(
        __name__,
        server=server,
        url_base_pathname="/dashboard/",
        external_stylesheets=[dbc.themes.BOOTSTRAP],
    )

    API_URL = "http://127.0.0.1:5000/api/tasks/dashboard"

    # Layout for Dash app
    dash_app.layout = dbc.Container(
        [
            html.H1("Task Dashboard", className="text-center my-4"),
            dbc.Row(
                [
                    dbc.Col(
                        dcc.Dropdown(
                            id="status-filter",
                            options=[
                                {"label": "All", "value": "All"},
                                {"label": "Pending", "value": "Pending"},
                                {"label": "Completed", "value": "Completed"},
                            ],
                            value="All",
                            placeholder="Filter by Status",
                            clearable=False,
                        ),
                        width=4,
                    ),
                    dbc.Col(
                        html.Div(id="selected-task-details", style={"marginTop": "10px"}),
                        width=8,
                    ),
                ],
                className="mb-4",
            ),
            dbc.Row(
                [
                    dbc.Col(
                        dcc.Graph(id="task-urgency-chart"),
                        width=8,
                    ),
                    dbc.Col(
                        dash_table.DataTable(
                            id="task-table",
                            columns=[
                                {"name": "Task ID", "id": "task_id"},
                                {"name": "Patient ID", "id": "patient_id"},
                                {"name": "Description", "id": "description"},
                                {"name": "Urgency", "id": "urgency"},
                                {"name": "Status", "id": "status"},
                                {"name": "Time Sensitive", "id": "time_sensitive"},
                            ],
                            style_table={"overflowX": "auto"},
                            style_header={"backgroundColor": "rgb(230, 230, 230)", "fontWeight": "bold"},
                            style_cell={"textAlign": "center"},
                            page_size=10,
                        ),
                        width=4,
                    ),
                ]
            ),
            dcc.Interval(
                id="interval-component",
                interval=10 * 1000,
                n_intervals=0,
            ),
        ],
        fluid=True,
    )

    # Fetch tasks from the Flask API
    def fetch_tasks():
        try:
            response = requests.get(API_URL)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching tasks: {e}")
            return []

    # Update task table and chart
    @dash_app.callback(
        [
            Output("task-table", "data"),
            Output("task-urgency-chart", "figure"),
        ],
        [
            Input("interval-component", "n_intervals"),
            Input("status-filter", "value"),
        ],
    )
    def update_dashboard(n_intervals, status_filter):
        tasks = fetch_tasks()
        if not tasks:
            return [], px.bar(title="No Tasks Available")

        df = pd.DataFrame(tasks)

        # Validate required columns exist in the DataFrame
        required_columns = {"task_id", "urgency", "status", "description", "time_sensitive"}
        if not required_columns.issubset(df.columns):
            return [], px.bar(title="Invalid Data Format")

        # Filter tasks based on status
        if status_filter != "All":
            df = df[df["status"] == status_filter]

        # Create a bar chart for task urgency
        if not df.empty:
            urgency_chart = px.bar(
                df,
                x="task_id",
                y="urgency",
                title="Task Urgency Levels",
                labels={"urgency": "Urgency Level", "task_id": "Task ID"},
                color="urgency",
                color_continuous_scale="Viridis",
                hover_data=["description", "time_sensitive"],
            )
            urgency_chart.update_layout(clickmode="event+select")
        else:
            urgency_chart = px.bar(title="No Tasks Matching Filter")

        return df.to_dict("records"), urgency_chart

    # Display selected task details
    @dash_app.callback(
        Output("selected-task-details", "children"),
        [Input("task-urgency-chart", "clickData")],
    )
    def display_task_details(click_data):
        if not click_data:
            return html.P("Click on a bar to see task details.", className="text-muted")

        task_id = click_data["points"][0]["x"]
        tasks = fetch_tasks()
        task = next((t for t in tasks if t["task_id"] == task_id), None)

        if task:
            return dbc.Card(
                dbc.CardBody(
                    [
                        html.H5(f"Task ID: {task['task_id']}"),
                        html.P(f"Patient ID: {task['patient_id']}"),
                        html.P(f"Description: {task['description']}"),
                        html.P(f"Urgency: {task['urgency']}"),
                        html.P(f"Status: {task['status']}"),
                        html.P(f"Time Sensitive: {task['time_sensitive']}"),
                    ]
                ),
                className="mt-3",
            )
        return html.P("Task not found.", className="text-danger")

    return dash_app
