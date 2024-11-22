use std::process::Command;
use std::path::Path;
use colored::*;
use anyhow::{Result, Context};

struct DiagnosticReport {
    metadata_ok: bool,
    compilation_issues: Vec<String>,
    dependency_warnings: Vec<String>,
}

fn run_diagnostics() -> Result<DiagnosticReport> {
    let mut report = DiagnosticReport {
        metadata_ok: false,
        compilation_issues: Vec::new(),
        dependency_warnings: Vec::new(),
    };

    println!("{}", "=== MATS Backend Diagnostic Tool ===".bold());
    
    // Check project structure
    check_project_structure()?;

    // Check cargo metadata
    println!("\n{}", "Checking project metadata...".blue());
    let metadata = Command::new("cargo")
        .current_dir(".")
        .args(["metadata", "--format-version=1"])
        .output()
        .context("Failed to run cargo metadata")?;
    
    report.metadata_ok = metadata.status.success();
    if !report.metadata_ok {
        println!("{}", "❌ Cargo metadata check failed".red());
        let error = String::from_utf8_lossy(&metadata.stderr);
        report.compilation_issues.push(format!("Metadata error: {}", error));
    }

    // Run verbose compilation
    println!("\n{}", "Running verbose compilation...".blue());
    let build = Command::new("cargo")
        .current_dir(".")
        .args(["build", "-vv", "--all-features"])
        .output()
        .context("Failed to run cargo build")?;
    
    if !build.status.success() {
        let stderr = String::from_utf8_lossy(&build.stderr);
        analyze_compilation_error(&stderr, &mut report);
    }

    // Check dependencies
    println!("\n{}", "Analyzing dependencies...".blue());
    if let Ok(tree) = Command::new("cargo")
        .current_dir(".")
        .args(["tree", "--duplicate"])
        .output() 
    {
        if tree.status.success() {
            let tree_output = String::from_utf8_lossy(&tree.stdout);
            check_dependency_conflicts(&tree_output, &mut report);
        }
    }

    Ok(report)
}

fn check_project_structure() -> Result<()> {
    let required_dirs = [
        "src/handlers",
        "src/middleware",
        "src/models",
        "src/services",
        "src/utils",
        "migrations",
    ];

    println!("\n{}", "Checking project structure...".blue());
    for dir in required_dirs {
        if !Path::new(dir).exists() {
            println!("{} Missing directory: {}", "⚠️".yellow(), dir);
        }
    }

    let required_files = [
        "src/main.rs",
        "src/lib.rs",
        "src/api.rs",
        "src/core.rs",
        "Cargo.toml",
    ];

    for file in required_files {
        if !Path::new(file).exists() {
            println!("{} Missing file: {}", "⚠️".yellow(), file);
        }
    }

    // Check for specific middleware files
    let middleware_files = [
        "src/middleware/error_handler.rs",
        "src/middleware/rate_limit.rs",
        "src/middleware/validation.rs",
        "src/middleware/versioning.rs",
    ];

    for file in middleware_files {
        if !Path::new(file).exists() {
            println!("{} Missing middleware file: {}", "⚠️".yellow(), file);
        }
    }

    Ok(())
}

fn analyze_compilation_error(error_output: &str, report: &mut DiagnosticReport) {
    if error_output.contains("missing crate for") {
        report.compilation_issues.push("Missing dependency detected".to_string());
        println!("{}", "🔍 Missing dependency detected. Check Cargo.toml".yellow());
    }
    
    if error_output.contains("private type") {
        report.compilation_issues.push("Visibility issue detected".to_string());
        println!("{}", "🔍 Visibility issue detected. Check pub/private modifiers".yellow());
    }
    
    if error_output.contains("cannot find") && error_output.contains("in this scope") {
        report.compilation_issues.push("Symbol not in scope".to_string());
        println!("{}", "🔍 Symbol not in scope. Check mod declarations and use statements".yellow());
    }
    
    if error_output.contains("mismatched types") {
        report.compilation_issues.push("Type mismatch detected".to_string());
        println!("{}", "🔍 Type mismatch detected. Check interface compatibility".yellow());
    }

    // Add specific checks for common actix-web issues
    if error_output.contains("the trait bound `BoxBody: Clone` is not satisfied") {
        report.compilation_issues.push("BoxBody Clone issue in middleware".to_string());
        println!("{}", "🔍 BoxBody Clone issue detected in middleware. Check middleware implementations".yellow());
    }

    if error_output.contains("no method named `clone` found for struct `ServiceRequest`") {
        report.compilation_issues.push("ServiceRequest Clone issue".to_string());
        println!("{}", "🔍 ServiceRequest Clone issue detected. Use HttpMessage trait or alternative cloning method".yellow());
    }
}

fn check_dependency_conflicts(tree_output: &str, report: &mut DiagnosticReport) {
    if tree_output.contains("[build-dependencies]") {
        report.dependency_warnings.push("Build dependencies might affect compilation".to_string());
        println!("{}", "⚠️  Build dependencies detected. Review build.rs if present".yellow());
    }
    
    let duplicate_count = tree_output.matches("(*)").count();
    if duplicate_count > 0 {
        report.dependency_warnings.push(format!("Found {} duplicate dependencies", duplicate_count));
        println!("{}", format!("⚠️  Found {} duplicate dependencies", duplicate_count).yellow());
    }

    // Check for specific actix-web related dependencies
    if !tree_output.contains("actix-web") {
        report.dependency_warnings.push("actix-web dependency not found".to_string());
        println!("{}", "⚠️  actix-web dependency not found in project".yellow());
    }
}

fn main() -> Result<()> {
    match run_diagnostics() {
        Ok(report) => {
            println!("\n{}", "=== Diagnostic Summary ===".bold());
            println!("Metadata Check: {}", if report.metadata_ok { "✅".green() } else { "❌".red() });
            
            if !report.compilation_issues.is_empty() {
                println!("\n{}", "Compilation Issues:".yellow());
                for issue in report.compilation_issues {
                    println!("- {}", issue);
                }
            }

            if !report.dependency_warnings.is_empty() {
                println!("\n{}", "Dependency Warnings:".yellow());
                for warning in report.dependency_warnings {
                    println!("- {}", warning);
                }
            }
        }
        Err(e) => {
            println!("{}", format!("Diagnostic failed: {}", e).red());
        }
    }

    Ok(())
} 