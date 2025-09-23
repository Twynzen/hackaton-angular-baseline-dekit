#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import { AngularBaselineAnalyzer, BaselineConfig } from '@angular-baseline-devkit/analyzer-core';
import { JsonReporter } from '@angular-baseline-devkit/reporters';

const program = new Command();

program
  .name('baseline-devkit')
  .description('Angular Baseline DevKit - Analyze Angular projects for baseline compatibility')
  .version('0.1.0');

program
  .command('analyze')
  .description('Analyze a project for baseline compatibility')
  .argument('[path]', 'Project path to analyze', '.')
  .option('--target <target>', 'Baseline target (widely, newly, or year)', 'widely')
  .option('--output <format>', 'Output format (json)', 'json')
  .option('--strict', 'Treat warnings as errors', false)
  .option('--allow <features>', 'Comma-separated list of allowed features', '')
  .option('--max-concurrency <number>', 'Maximum concurrent file analysis', '4')
  .action(async (projectPath: string, options: any) => {
    try {
      console.log(`🔍 Analyzing Angular project at: ${path.resolve(projectPath)}`);

      // Parse target
      let target: 'widely' | 'newly' | number = options.target;
      if (!isNaN(Number(options.target))) {
        target = Number(options.target);
      }

      // Parse allowed features
      const allow = options.allow
        ? options.allow.split(',').map((f: string) => f.trim()).filter(Boolean)
        : [];

      const config: BaselineConfig = {
        target,
        strict: options.strict,
        allow
      };

      const analyzer = new AngularBaselineAnalyzer();
      const reporter = new JsonReporter();

      console.log(`📋 Configuration:`);
      console.log(`   Target: ${target}`);
      console.log(`   Strict mode: ${config.strict}`);
      console.log(`   Allowed features: ${allow.length > 0 ? allow.join(', ') : 'none'}`);
      console.log('');

      // Run analysis
      const report = await analyzer.analyze({
        config,
        projectRoot: path.resolve(projectPath),
        maxConcurrency: parseInt(options.maxConcurrency, 10)
      });

      // Generate console output
      const consoleOutput = await reporter.generateConsoleOutput(report);
      console.log(consoleOutput);

      // Generate JSON report
      if (options.output === 'json') {
        const outputPath = path.join(projectPath, 'baseline-report', 'report.json');
        await reporter.generateReport(report, {
          outputPath,
          projectRoot: path.resolve(projectPath)
        });
        console.log(`📄 JSON report generated: ${outputPath}`);
      }

      // Set exit code based on results
      const hasErrors = report.summary.errors > 0;
      const hasWarnings = report.summary.warnings > 0;

      if (hasErrors || (config.strict && hasWarnings)) {
        process.exit(1);
      } else {
        process.exit(0);
      }

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      process.exit(2);
    }
  });

program
  .command('validate-registry')
  .description('Validate feature registry against web-features database')
  .action(async () => {
    try {
      console.log('🔍 Validating feature registry...');

      const analyzer = new AngularBaselineAnalyzer();
      const result = analyzer.validateFeatureRegistry();

      console.log(`✅ Valid features: ${result.valid.length}`);
      if (result.invalid.length > 0) {
        console.log(`❌ Invalid features: ${result.invalid.length}`);
        result.invalid.forEach(featureId => {
          console.log(`   - ${featureId}`);
        });
        process.exit(1);
      } else {
        console.log('🎉 All feature IDs are valid!');
        process.exit(0);
      }
    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(2);
    }
  });

program.parse();