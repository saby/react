@Library('pipeline') _

def version = '23.3000'

node (get_label()) {
    checkout_pipeline("rc-${version}")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('saby_react', version)
}